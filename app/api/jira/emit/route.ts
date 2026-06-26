import { NextResponse } from "next/server";

import { applyTransition, getChamberInitiative } from "@/lib/chamber/ideas";
import { runChamberSpec } from "@/lib/chamber/pipeline";
import { emitJira } from "@/lib/jira/pipeline";
import type { JiraAdapterKind } from "@/lib/jira/types";
import { ensureSeeded } from "@/lib/store/ensure-seeded";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const body = (await request.json()) as {
      initiativeId?: string;
      adapter?: JiraAdapterKind;
      actor?: string;
      skipSpec?: boolean;
    };

    if (!body.initiativeId) {
      return NextResponse.json({ ok: false, error: "initiativeId required" }, { status: 400 });
    }

    const idea = getChamberInitiative(body.initiativeId);
    if (!idea) {
      return NextResponse.json({ ok: false, error: "idea not found" }, { status: 404 });
    }
    if (idea._workflow !== "assigned") {
      return NextResponse.json({ ok: false, error: "must be assigned to mission before graduation" }, { status: 400 });
    }
    if (idea._funding !== "FUNDED") {
      return NextResponse.json({ ok: false, error: "only funded ideas graduate to backlog" }, { status: 400 });
    }

    if (!body.skipSpec) {
      await runChamberSpec(body.initiativeId);
    }

    const outcome = await emitJira(body.initiativeId, body.adapter ?? "file");
    if (outcome.status === "refused") {
      return NextResponse.json({ ok: false, refused: true, reasons: outcome.reasons }, { status: 422 });
    }

    const graduated = applyTransition(body.initiativeId, "graduate", { actor: body.actor });

    return NextResponse.json({ ok: true, outcome, initiative: graduated });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}