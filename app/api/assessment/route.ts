import { NextResponse } from "next/server";

import type { AssessmentFields } from "@/lib/chamber/assessment";
import { applyTransition, getChamberInitiative, runAssessmentAndScore, saveChamber } from "@/lib/chamber/ideas";
import { ensureSeeded } from "@/lib/store/ensure-seeded";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const body = (await request.json()) as {
      initiativeId?: string;
      assessment?: AssessmentFields;
      actor?: string;
      scoreOnly?: boolean;
    };

    if (!body.initiativeId || !body.assessment) {
      return NextResponse.json({ ok: false, error: "initiativeId and assessment required" }, { status: 400 });
    }

    const current = getChamberInitiative(body.initiativeId);
    if (!current) {
      return NextResponse.json({ ok: false, error: "idea not found" }, { status: 404 });
    }

    saveChamber({ ...current, _assessment: body.assessment });

    if (body.scoreOnly) {
      return NextResponse.json({ ok: true, saved: true });
    }

    if (current._workflow === "triage") {
      applyTransition(body.initiativeId, "start_assessment", { actor: body.actor });
    }

    const { initiative, prioritize } = runAssessmentAndScore(
      body.initiativeId,
      body.assessment,
      body.actor,
    );

    return NextResponse.json({
      ok: true,
      initiative,
      funding: initiative._funding,
      score: initiative._score,
      rank: initiative._rank,
      chainHead: prioritize.chainHead,
    });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}