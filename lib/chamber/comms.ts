import type { MissionId } from "./missions";
import { missionById } from "./missions";

export type CommsKind =
  | "received"
  | "not_aligned"
  | "triage_assigned"
  | "assessment_started"
  | "scored"
  | "mission_assigned"
  | "strategy_track"
  | "graduated";

export type CommsRecord = {
  id: string;
  kind: CommsKind;
  subject: string;
  body: string;
  sentAt: string;
  actor?: string;
};

type CommsVars = {
  title: string;
  submitterName: string;
  triageOwner?: string;
  mission?: MissionId;
  score?: number;
  rank?: number;
  cohortWeek?: string;
};

function id(): string {
  return `comms-${Date.now().toString(36)}`;
}

export function buildComms(kind: CommsKind, vars: CommsVars): Omit<CommsRecord, "sentAt"> {
  const missionLabel = vars.mission ? missionById(vars.mission)?.label : undefined;

  switch (kind) {
    case "received":
      return {
        id: id(),
        kind,
        subject: `Received: ${vars.title}`,
        body: `Hi ${vars.submitterName},\n\nWe received your idea "${vars.title}" in this week's intake (${vars.cohortWeek ?? "current cohort"}).\n\nWhat happens next:\n1. Strategy alignment review (Wednesday meeting)\n2. If aligned — triage owner assigned; we'll reach out for a short follow-up\n3. Prioritization score and mission assignment (Thursday meeting)\n\nYou'll hear from us at each step. Nothing enters a mission backlog until it graduates from this process.\n`,
      };
    case "not_aligned":
      return {
        id: id(),
        kind,
        subject: `Update: ${vars.title}`,
        body: `Hi ${vars.submitterName},\n\nThank you for submitting "${vars.title}". After strategy review, this idea is not aligned with current Home Lending strategy priorities.\n\nWe're closing this intake for now and will continue to monitor the space. Please resubmit if circumstances change.\n`,
      };
    case "triage_assigned":
      return {
        id: id(),
        kind,
        subject: `Triage: ${vars.title}`,
        body: `Hi ${vars.submitterName},\n\n"${vars.title}" passed strategy alignment. ${vars.triageOwner ?? "A triage owner"} will reach out for a 10–30 minute follow-up to clarify scope before instant assessment.\n`,
      };
    case "assessment_started":
      return {
        id: id(),
        kind,
        subject: `Assessment in progress: ${vars.title}`,
        body: `Hi ${vars.submitterName},\n\nTriage on "${vars.title}" is complete. We're running the instant business assessment and prioritization score. Results will be reviewed in Thursday's meeting.\n`,
      };
    case "scored":
      return {
        id: id(),
        kind,
        subject: `Scored: ${vars.title}`,
        body: `Hi ${vars.submitterName},\n\n"${vars.title}" has been scored (priority ${vars.score ?? "—"}, rank ${vars.rank ?? "—"}). Mission assignment is pending Thursday committee review.\n`,
      };
    case "mission_assigned":
      return {
        id: id(),
        kind,
        subject: `Assigned: ${vars.title}`,
        body: `Hi ${vars.submitterName},\n\n"${vars.title}" is assigned to ${missionLabel ?? "a mission backlog"} with priority score ${vars.score ?? "—"}.\n\nProduct management will pick this up for discovery. This idea is not on any Jira board until graduation from centralized intake.\n`,
      };
    case "strategy_track":
      return {
        id: id(),
        kind,
        subject: `Strategy track: ${vars.title}`,
        body: `Hi ${vars.submitterName},\n\n"${vars.title}" needs additional strategy work before mission assignment. A strategy manager will own updates on a longer arc.\n`,
      };
    case "graduated":
      return {
        id: id(),
        kind,
        subject: `Graduated to backlog: ${vars.title}`,
        body: `Hi ${vars.submitterName},\n\n"${vars.title}" has graduated from centralized intake to ${missionLabel ?? "the mission backlog"}. PM discovery begins from the scored intake record.\n`,
      };
  }
}