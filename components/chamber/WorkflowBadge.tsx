import { WORKFLOW_STATES, type WorkflowState } from "@/lib/chamber/workflow";

const tone: Partial<Record<WorkflowState, string>> = {
  submitted: "text-muted border-border",
  strategy_review: "text-accent border-accent/40",
  strategy_aligned: "text-funded border-funded/40",
  closed_not_aligned: "text-muted border-border line-through",
  triage: "text-benched border-benched/40",
  assessment: "text-accent border-accent/40",
  scored: "text-funded border-funded/40",
  assigned: "text-funded border-funded/50",
  strategy_track: "text-benched border-benched/40",
  graduated: "text-funded border-funded/50",
};

export function WorkflowBadge({ state }: { state: WorkflowState }) {
  const label = WORKFLOW_STATES[state]?.label ?? state;
  return (
    <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase ${tone[state] ?? "text-muted border-border"}`}>
      {label}
    </span>
  );
}