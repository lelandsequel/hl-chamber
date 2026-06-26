import type { AssessmentFields } from "./assessment";
import type { ChannelId } from "./channels";
import type { ChamberInitiative } from "./types";
import type { WorkflowAction } from "./workflow";

export type ChamberSpecView = {
  initiativeId: string;
  channel: ChannelId;
  cosmic: {
    runHash: string;
    gate: { summary: { NO_OBJECTION: number; HOLD: number; REFUSE: number } };
    ledgerEntry: { hash: string; seq: number };
    provenanceCount: number;
  };
  ticketSlice: { epicTitle: string; storyCount: number; emitHash: string };
  update: {
    verdict: "ready" | "needs-resolution";
    reEstimatedEffortTeamWeeks: number;
    roughEffortTeamWeeks: number;
    openIssueCount: number;
  };
  strataAudit: {
    refused: boolean;
    speedup?: number;
    queryHash: string;
  };
  docs: {
    dir: string;
    epicStories: string;
    fullSpec: string;
  };
  ledgerSha?: string;
};

export async function submitIntakeViaApi(
  channel: ChannelId,
  values: Record<string, string>,
): Promise<{ initiativeId: string; workflow: string; cohortWeek?: string }> {
  const res = await fetch("/api/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, values }),
  });
  const data = (await res.json()) as {
    ok: boolean;
    refused?: boolean;
    initiativeId?: string;
    workflow?: string;
    cohortWeek?: string;
    error?: string;
    errors?: string[];
  };
  if (!res.ok || !data.ok) {
    const err = new Error(data.error ?? data.errors?.join("; ") ?? "intake failed") as Error & {
      cadmusErrors?: string[];
    };
    if (data.errors) err.cadmusErrors = data.errors;
    throw err;
  }
  return { initiativeId: data.initiativeId!, workflow: data.workflow!, cohortWeek: data.cohortWeek };
}

export async function workflowAction(
  initiativeId: string,
  action: WorkflowAction,
  opts: Record<string, unknown> = {},
): Promise<ChamberInitiative> {
  const res = await fetch("/api/workflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initiativeId, action, ...opts }),
  });
  const data = (await res.json()) as { ok: boolean; initiative?: ChamberInitiative; error?: string };
  if (!res.ok || !data.ok || !data.initiative) throw new Error(data.error ?? "workflow failed");
  return data.initiative;
}

export async function runAssessmentViaApi(
  initiativeId: string,
  assessment: AssessmentFields,
  actor?: string,
): Promise<ChamberInitiative> {
  const res = await fetch("/api/assessment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initiativeId, assessment, actor }),
  });
  const data = (await res.json()) as { ok: boolean; initiative?: ChamberInitiative; error?: string };
  if (!res.ok || !data.ok || !data.initiative) throw new Error(data.error ?? "assessment failed");
  return data.initiative;
}

export async function runChamberSpecViaApi(initiativeId: string): Promise<ChamberSpecView> {
  const res = await fetch("/api/chamber/spec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initiativeId }),
  });
  const data = (await res.json()) as { ok: boolean; spec?: ChamberSpecView; error?: string };
  if (!res.ok || !data.ok || !data.spec) throw new Error(data.error ?? "spec failed");
  return data.spec;
}

export async function graduateToJiraViaApi(initiativeId: string, actor?: string) {
  const res = await fetch("/api/jira/emit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initiativeId, actor }),
  });
  const data = (await res.json()) as { ok: boolean; error?: string; outcome?: unknown; initiative?: ChamberInitiative };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "graduation failed");
  return data;
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}