import { NextResponse } from "next/server";

import { applyTransition } from "@/lib/chamber/ideas";
import type { MissionId } from "@/lib/chamber/missions";
import type { WorkflowAction } from "@/lib/chamber/workflow";
import { ensureSeeded } from "@/lib/store/ensure-seeded";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const body = (await request.json()) as {
      initiativeId?: string;
      action?: WorkflowAction;
      actor?: string;
      triageOwner?: string;
      triagePool?: "portfolio" | "production" | "strategy";
      mission?: string;
      sendComms?: boolean;
    };

    if (!body.initiativeId || !body.action) {
      return NextResponse.json({ ok: false, error: "initiativeId and action required" }, { status: 400 });
    }

    const updated = applyTransition(body.initiativeId, body.action, {
      actor: body.actor,
      triageOwner: body.triageOwner,
      triagePool: body.triagePool,
      mission: body.mission as MissionId | undefined,
      sendComms: body.sendComms,
    });

    return NextResponse.json({ ok: true, initiative: updated });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}