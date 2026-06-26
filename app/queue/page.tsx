import { Suspense } from "react";

import { IdeaRow } from "@/components/chamber/IdeaRow";
import { WORKFLOW_STATES, type WorkflowState } from "@/lib/chamber/workflow";

import { getQueue } from "./actions";

export const dynamic = "force-dynamic";

const ORDER: WorkflowState[] = [
  "submitted",
  "strategy_review",
  "strategy_aligned",
  "triage",
  "assessment",
  "scored",
  "assigned",
  "strategy_track",
  "closed_not_aligned",
  "graduated",
];

export default async function QueuePage() {
  const { byState } = await getQueue();
  return (
    <Suspense fallback={<div className="text-muted">Loading…</div>}>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">Queue</h1>
        {ORDER.map((state) => {
          const items = byState[state];
          if (!items.length) return null;
          return (
            <section key={state}>
              <h2 className="font-mono text-xs uppercase text-muted">
                {WORKFLOW_STATES[state].label} ({items.length})
              </h2>
              <div className="mt-2 space-y-2">
                {items.map((idea) => (
                  <IdeaRow key={idea.id} idea={idea} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Suspense>
  );
}