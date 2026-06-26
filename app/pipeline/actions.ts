"use server";

import { loadAndPrioritize } from "@/lib/agility/pipeline";
import { verifyLedger, receiptsForInitiative } from "@/lib/store/ledger";
import { ensureSeeded } from "@/lib/store/ensure-seeded";
import type { ChamberInitiative } from "@/lib/chamber/types";

export type PipelineItem = ChamberInitiative & {
  chainReceipts?: ReturnType<typeof receiptsForInitiative>;
};

export async function getPipeline() {
  ensureSeeded();
  const result = loadAndPrioritize();
  return {
    queue: result.ranked.map((it) => ({
      ...(it as ChamberInitiative),
      chainReceipts: receiptsForInitiative(it.id),
    })),
    chainHead: result.chainHead,
    verify: verifyLedger(),
    capacity: result.capacity,
    capacityUsed: result.capacityUsed,
  };
}