"use server";

import { listChamberInitiatives } from "@/lib/chamber/ideas";
import { WORKFLOW_STATES, type WorkflowState } from "@/lib/chamber/workflow";
import { ensureSeeded } from "@/lib/store/ensure-seeded";

export async function getQueue() {
  ensureSeeded();
  const all = listChamberInitiatives();
  const byState = Object.keys(WORKFLOW_STATES).reduce(
    (acc, key) => {
      acc[key as WorkflowState] = all.filter((i) => (i._workflow ?? "submitted") === key);
      return acc;
    },
    {} as Record<WorkflowState, typeof all>,
  );
  return { all, byState };
}