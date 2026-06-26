/** July 1 operating model — workflow states, cohorts, transitions. */

export const WORKFLOW_STATES = {
  submitted: { label: "Submitted", meeting: "wednesday" as const },
  strategy_review: { label: "Strategy review", meeting: "wednesday" as const },
  strategy_aligned: { label: "Strategy aligned", meeting: null },
  closed_not_aligned: { label: "Closed — not aligned", meeting: null, terminal: true },
  triage: { label: "Triage", meeting: null },
  assessment: { label: "Assessment", meeting: null },
  scored: { label: "Scored", meeting: "thursday" as const },
  assigned: { label: "Assigned to mission", meeting: "thursday" as const },
  strategy_track: { label: "Strategy track", meeting: null, terminal: true },
  graduated: { label: "Graduated to backlog", meeting: null, terminal: true },
} as const;

export type WorkflowState = keyof typeof WORKFLOW_STATES;

export type TriagePool = "portfolio" | "production" | "strategy";

export type WorkflowAction =
  | "open_strategy_review"
  | "align_strategy"
  | "close_not_aligned"
  | "assign_triage"
  | "start_assessment"
  | "complete_assessment"
  | "assign_mission"
  | "route_strategy_track"
  | "graduate";

export type TransitionMeta = {
  actor?: string;
  triageOwner?: string;
  triagePool?: TriagePool;
  mission?: string;
  note?: string;
};

const TRANSITIONS: Record<WorkflowAction, { from: WorkflowState[]; to: WorkflowState }> = {
  open_strategy_review: { from: ["submitted"], to: "strategy_review" },
  align_strategy: { from: ["strategy_review"], to: "strategy_aligned" },
  close_not_aligned: { from: ["submitted", "strategy_review"], to: "closed_not_aligned" },
  assign_triage: { from: ["strategy_aligned"], to: "triage" },
  start_assessment: { from: ["triage"], to: "assessment" },
  complete_assessment: { from: ["assessment"], to: "scored" },
  assign_mission: { from: ["scored"], to: "assigned" },
  route_strategy_track: { from: ["scored", "triage", "assessment"], to: "strategy_track" },
  graduate: { from: ["assigned"], to: "graduated" },
};

export function canTransition(state: WorkflowState, action: WorkflowAction): boolean {
  const rule = TRANSITIONS[action];
  return rule.from.includes(state);
}

export function nextState(state: WorkflowState, action: WorkflowAction): WorkflowState {
  const rule = TRANSITIONS[action];
  if (!rule.from.includes(state)) {
    throw new Error(`cannot ${action} from ${state}`);
  }
  return rule.to;
}

/** ISO week id e.g. 2026-W26 */
export function cohortWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function meetingBucket(state: WorkflowState): "wednesday" | "thursday" | "active" | "closed" {
  const meta = WORKFLOW_STATES[state];
  if ("terminal" in meta && meta.terminal) return "closed";
  if (meta.meeting === "wednesday") return "wednesday";
  if (meta.meeting === "thursday") return "thursday";
  return "active";
}