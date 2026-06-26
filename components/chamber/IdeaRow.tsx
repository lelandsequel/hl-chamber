import Link from "next/link";

import { FundingPill } from "@/components/FundingPill";
import type { ChamberInitiative } from "@/lib/chamber/types";

import { WorkflowBadge } from "./WorkflowBadge";

export function IdeaRow({ idea, highlight }: { idea: ChamberInitiative; highlight?: boolean }) {
  const state = idea._workflow ?? "submitted";
  return (
    <Link
      href={`/idea/${idea.id}`}
      className={`block rounded-lg border p-3 transition hover:border-accent/40 ${highlight ? "border-accent bg-accent/5" : "border-border"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-medium">{idea.title}</span>
          {idea._chamberChannel && (
            <span className="ml-2 font-mono text-[10px] text-muted">{idea._chamberChannel}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WorkflowBadge state={state} />
          {idea._score != null && <span className="font-mono text-xs text-accent">{idea._score}</span>}
          {idea._funding && <FundingPill funding={idea._funding} />}
        </div>
      </div>
      <div className="mt-1 flex flex-wrap gap-3 font-mono text-[10px] text-muted">
        {idea._submitter?.name && <span>{idea._submitter.name}</span>}
        {idea._triageOwner && <span>→ {idea._triageOwner}</span>}
        {idea._cohortWeek && <span>{idea._cohortWeek}</span>}
      </div>
    </Link>
  );
}