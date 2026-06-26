"use server";

import { getChamberInitiative } from "@/lib/chamber/ideas";
import { getLatestJiraEmit } from "@/lib/jira/pipeline";
import { getLooperSpec } from "@/lib/looper/spec-pipeline";
import { ensureSeeded } from "@/lib/store/ensure-seeded";
import { receiptsForInitiative } from "@/lib/store/ledger";

export async function getIdea(id: string) {
  ensureSeeded();
  const idea = getChamberInitiative(id);
  if (!idea) return null;
  const spec = getLooperSpec(id);
  const jira = getLatestJiraEmit(id);
  return {
    idea,
    chainReceipts: receiptsForInitiative(id),
    hasSpec: Boolean(spec),
    jira,
  };
}