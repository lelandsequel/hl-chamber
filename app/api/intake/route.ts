import { NextResponse } from "next/server";

import { channelById, type ChannelId } from "@/lib/chamber/channels";
import { initiativeFromRequester } from "@/lib/chamber/intake-to-initiative";
import { submitRequester } from "@/lib/chamber/ideas";
import { ensureSeeded } from "@/lib/store/ensure-seeded";

export const dynamic = "force-dynamic";

function validateRequester(values: Record<string, string>): string[] {
  const errors: string[] = [];
  if (!values.title?.trim()) errors.push("title required");
  if (!values.summary?.trim()) errors.push("summary required");
  if (!values.businessProblem?.trim()) errors.push("business problem required");
  if (!values.submitterName?.trim()) errors.push("name required");
  if (!values.submitterEmail?.trim()) errors.push("email required");
  return errors;
}

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const body = (await request.json()) as {
      channel?: ChannelId;
      values?: Record<string, string>;
    };
    const channel = channelById(body.channel ?? "");
    if (!channel || !body.values) {
      return NextResponse.json({ ok: false, error: "channel and values required" }, { status: 400 });
    }

    const errors = validateRequester(body.values);
    if (errors.length) {
      return NextResponse.json({ ok: false, refused: true, errors }, { status: 422 });
    }

    const initiative = submitRequester(initiativeFromRequester(channel, body.values));

    return NextResponse.json({
      ok: true,
      initiativeId: initiative.id,
      workflow: initiative._workflow,
      cohortWeek: initiative._cohortWeek,
    });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}