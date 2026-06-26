import { intakeAndPrioritize, loadAndPrioritize } from "@/lib/agility/pipeline";
import { getInitiative, listInitiatives, replaceInitiatives, upsertInitiative } from "@/lib/store/initiatives";

import { assessmentComplete, mergeAssessmentIntoInitiative, type AssessmentFields } from "./assessment";
import { buildComms } from "./comms";
import { channelById } from "./channels";
import { defaultMissionForChannel } from "./missions";
import type { ChamberInitiative } from "./types";
import {
  canTransition,
  cohortWeek,
  meetingBucket,
  nextState,
  type TriagePool,
  type WorkflowAction,
  type WorkflowState,
} from "./workflow";

export function asChamber(initiative: ReturnType<typeof getInitiative>): ChamberInitiative | null {
  return initiative as ChamberInitiative | null;
}

export function getChamberInitiative(id: string): ChamberInitiative | null {
  return asChamber(getInitiative(id));
}

export function saveChamber(initiative: ChamberInitiative): void {
  upsertInitiative(initiative);
}

export function listChamberInitiatives(): ChamberInitiative[] {
  return listInitiatives() as ChamberInitiative[];
}

export function listByWorkflow(state?: WorkflowState): ChamberInitiative[] {
  const all = listChamberInitiatives();
  if (!state) return all.filter((i) => i._workflow && i._workflow !== "graduated");
  return all.filter((i) => i._workflow === state);
}

export function listCohort(week?: string): ChamberInitiative[] {
  const w = week ?? cohortWeek();
  return listChamberInitiatives().filter((i) => i._cohortWeek === w);
}

export function wednesdayQueue(week?: string): ChamberInitiative[] {
  return listCohort(week).filter((i) => {
    const s = i._workflow ?? "submitted";
    return meetingBucket(s) === "wednesday" || s === "submitted";
  });
}

export function thursdayQueue(week?: string): ChamberInitiative[] {
  return listCohort(week).filter((i) => {
    const s = i._workflow ?? "submitted";
    return meetingBucket(s) === "thursday";
  });
}

export function activeWorkbench(): ChamberInitiative[] {
  return listChamberInitiatives().filter((i) => {
    const s = i._workflow ?? "submitted";
    return meetingBucket(s) === "active";
  });
}

type TransitionOpts = {
  actor?: string;
  triageOwner?: string;
  triagePool?: TriagePool;
  mission?: ChamberInitiative["_mission"];
  assessment?: AssessmentFields;
  sendComms?: boolean;
};

export function applyTransition(id: string, action: WorkflowAction, opts: TransitionOpts = {}) {
  const current = getChamberInitiative(id);
  if (!current) throw new Error(`idea not found: ${id}`);
  const state = current._workflow ?? "submitted";
  if (!canTransition(state, action)) {
    throw new Error(`cannot ${action} from ${state}`);
  }
  const to = nextState(state, action);
  const updated: ChamberInitiative = {
    ...current,
    _workflow: to,
    _workflowLog: [
      ...(current._workflowLog ?? []),
      { at: new Date().toISOString(), action, from: state, to, actor: opts.actor },
    ],
  };

  if (opts.triageOwner) updated._triageOwner = opts.triageOwner;
  if (opts.triagePool) updated._triagePool = opts.triagePool;
  if (opts.mission) updated._mission = opts.mission;
  if (opts.assessment) updated._assessment = opts.assessment;

  const comms = [...(updated._comms ?? [])];
  const submitter = updated._submitter?.name ?? "Requester";
  const base = {
    title: updated.title,
    submitterName: submitter,
    triageOwner: updated._triageOwner,
    mission: updated._mission,
    cohortWeek: updated._cohortWeek,
    score: updated._score,
    rank: updated._rank,
  };

  if (opts.sendComms !== false) {
    if (action === "close_not_aligned") comms.push({ ...buildComms("not_aligned", base), sentAt: new Date().toISOString(), actor: opts.actor });
    if (action === "assign_triage") comms.push({ ...buildComms("triage_assigned", base), sentAt: new Date().toISOString(), actor: opts.actor });
    if (action === "start_assessment") comms.push({ ...buildComms("assessment_started", base), sentAt: new Date().toISOString(), actor: opts.actor });
    if (action === "assign_mission") comms.push({ ...buildComms("mission_assigned", base), sentAt: new Date().toISOString(), actor: opts.actor });
    if (action === "route_strategy_track") comms.push({ ...buildComms("strategy_track", base), sentAt: new Date().toISOString(), actor: opts.actor });
    if (action === "graduate") comms.push({ ...buildComms("graduated", base), sentAt: new Date().toISOString(), actor: opts.actor });
  }
  updated._comms = comms;

  if (action === "assign_triage" && !updated._mission) {
    updated._mission = defaultMissionForChannel(updated._chamberChannel ?? "general");
  }

  saveChamber(updated);
  return updated;
}

export function submitRequester(initiative: ChamberInitiative) {
  const withComms: ChamberInitiative = {
    ...initiative,
    _comms: [
      {
        ...buildComms("received", {
          title: initiative.title,
          submitterName: initiative._submitter?.name ?? "Requester",
          cohortWeek: initiative._cohortWeek,
        }),
        sentAt: new Date().toISOString(),
      },
    ],
  };
  const existing = listInitiatives().filter((e) => e.id !== withComms.id);
  replaceInitiatives([...existing, withComms]);
  return withComms;
}

export function runAssessmentAndScore(id: string, assessment: AssessmentFields, actor?: string) {
  if (!assessmentComplete(assessment)) {
    throw new Error("assessment fields incomplete");
  }
  const current = getChamberInitiative(id);
  if (!current) throw new Error(`idea not found: ${id}`);
  const channel = channelById(current._chamberChannel ?? "general");
  if (!channel) throw new Error("channel missing");

  const merged = mergeAssessmentIntoInitiative(current, channel.id, assessment, channel.mandateByDefault);
  const chamberMerged: ChamberInitiative = {
    ...merged,
    _chamberChannel: current._chamberChannel,
    _workflow: current._workflow,
    _cohortWeek: current._cohortWeek,
    _submittedAt: current._submittedAt,
    _submitter: current._submitter,
    _requesterFields: current._requesterFields,
    _triageOwner: current._triageOwner,
    _triagePool: current._triagePool,
    _mission: current._mission,
    _assessment: assessment,
    _comms: current._comms,
    _workflowLog: current._workflowLog,
  };

  const result = intakeAndPrioritize(chamberMerged);
  const ranked = result.ranked.find((r) => r.id === id) as ChamberInitiative | undefined;
  if (!ranked) throw new Error("rank failed");

  const scored: ChamberInitiative = {
    ...ranked,
    _workflow: "scored",
    _workflowLog: [
      ...(ranked._workflowLog ?? []),
      { at: new Date().toISOString(), action: "complete_assessment", from: "assessment", to: "scored", actor },
    ],
    _comms: [
      ...(ranked._comms ?? []),
      {
        ...buildComms("scored", {
          title: ranked.title,
          submitterName: ranked._submitter?.name ?? "Requester",
          score: ranked._score,
          rank: ranked._rank,
        }),
        sentAt: new Date().toISOString(),
        actor,
      },
    ],
  };
  saveChamber(scored);
  return { initiative: scored, prioritize: result };
}

export function getOpsDashboard() {
  const week = cohortWeek();
  return {
    week,
    wednesday: wednesdayQueue(week),
    thursday: thursdayQueue(week),
    active: activeWorkbench(),
    all: listChamberInitiatives(),
    prioritize: loadAndPrioritize(),
  };
}