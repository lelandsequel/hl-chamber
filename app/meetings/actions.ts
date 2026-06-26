"use server";

import { getOpsDashboard } from "@/lib/chamber/ideas";
import { ensureSeeded } from "@/lib/store/ensure-seeded";
import { verifyLedger } from "@/lib/store/ledger";

export async function getMeetings() {
  ensureSeeded();
  const dash = getOpsDashboard();
  return {
    week: dash.week,
    wednesday: dash.wednesday,
    thursday: dash.thursday,
    active: dash.active,
    capacity: dash.prioritize.capacity,
    capacityUsed: dash.prioritize.capacityUsed,
    verify: verifyLedger(),
    chainHead: dash.prioritize.chainHead,
  };
}