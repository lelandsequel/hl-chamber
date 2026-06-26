import { auditQuery } from "@/lib/strata/audit";
import { runLooperSpec, type LooperSpecResult } from "@/lib/looper/spec-pipeline";

import { getInitiative } from "@/lib/store/initiatives";

import type { ChannelId } from "./channels";
import type { ChamberInitiative } from "./types";

export type ChamberSpecResult = LooperSpecResult & {
  strataAudit: ReturnType<typeof auditQuery>;
  channel: ChannelId;
};

/** Full Chamber run: COSMIC spec + epic/story docs + STRATA certified audit receipt. */
export async function runChamberSpec(initiativeId: string): Promise<ChamberSpecResult> {
  const init = getInitiative(initiativeId) as ChamberInitiative | null;
  const channel = init?._chamberChannel ?? "general";
  const spec = await runLooperSpec(initiativeId);
  const strataAudit = auditQuery(
    `SELECT well_id, SUM(oil_bbl) FROM production_daily WHERE report_date >= '2026-01-01' GROUP BY well_id`,
  );
  return { ...spec, strataAudit, channel };
}