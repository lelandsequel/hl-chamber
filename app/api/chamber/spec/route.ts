import { NextResponse } from "next/server";

import { runChamberSpec } from "@/lib/chamber/pipeline";
import { ensureSeeded } from "@/lib/store/ensure-seeded";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function toView(result: Awaited<ReturnType<typeof runChamberSpec>>) {
  return {
    initiativeId: result.initiativeId,
    channel: result.channel,
    cosmic: result.cosmic,
    ticketSlice: result.ticketSlice,
    update: {
      verdict: result.update.verdict,
      reEstimatedEffortTeamWeeks: result.update.reEstimatedEffortTeamWeeks,
      roughEffortTeamWeeks: result.update.roughEffortTeamWeeks,
      openIssueCount: result.update.openIssueCount,
    },
    strataAudit: {
      refused: result.strataAudit.refused,
      speedup: result.strataAudit.speedup,
      queryHash: result.strataAudit.queryHash,
    },
    docs: {
      dir: result.docs.dir,
      epicStories: result.docs.epicStories,
      fullSpec: result.docs.fullSpec,
    },
    ledgerSha: result.ledgerSha,
  };
}

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const body = (await request.json()) as { initiativeId?: string };
    if (!body.initiativeId) {
      return NextResponse.json({ ok: false, error: "initiativeId required" }, { status: 400 });
    }
    const result = await runChamberSpec(body.initiativeId);
    return NextResponse.json({ ok: true, spec: toView(result) });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}