import type { Initiative } from "@/lib/agility/types";

import type { ChannelId, IntakeChannel } from "./channels";
import type { ChamberInitiative } from "./types";
import { cohortWeek } from "./workflow";

export type ChannelFormValues = Record<string, string>;

function slugId(channel: ChannelId, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
  return `HL-${channel}-${slug || "idea"}-${Date.now().toString(36)}`;
}

/** Thin requester submit → Chamber initiative shell (ops enriches later). */
export function initiativeFromRequester(
  channel: IntakeChannel,
  values: ChannelFormValues,
): ChamberInitiative {
  const title = (values.title ?? "").trim();
  const summary = (values.summary ?? "").trim();
  const businessProblem = (values.businessProblem ?? "").trim();
  const additional = (values.additionalInfo ?? "").trim();
  const description = [summary, businessProblem, additional].filter(Boolean).join("\n\n");

  const now = new Date().toISOString();

  const initiative: ChamberInitiative = {
    id: slugId(channel.id, title),
    title,
    description,
    area: channel.defaultArea,
    sponsor: (values.submitterName ?? "").trim() || "Home Lending Intake",
    outcome: summary.slice(0, 120) || title,
    valueType: channel.defaultValueType,
    reach: { value: 0, unit: "pending", source: "ops-triage" },
    effortTeamWeeks: 1,
    deliveryConfidence: 0.5,
    valueConfidence: 0.5,
    _chamberChannel: channel.id,
    _workflow: "submitted",
    _cohortWeek: cohortWeek(),
    _submittedAt: now,
    _submitter: {
      name: (values.submitterName ?? "").trim(),
      email: (values.submitterEmail ?? "").trim(),
    },
    _requesterFields: values,
    _comms: [],
    _workflowLog: [],
  };

  if (channel.mandateByDefault) {
    initiative.mandate = true;
    initiative.mandateCitation = "Pending triage — regulatory channel";
  }

  return initiative;
}

/** Legacy: full form → Initiative (used after assessment merge). */
export function initiativeFromChannel(
  channel: IntakeChannel,
  values: ChannelFormValues,
  sponsor = "Home Lending Intake",
): Initiative {
  const title = (values.title ?? "").trim();
  const summary = (values.summary ?? "").trim();
  const businessProblem = (values.businessProblem ?? "").trim();
  const additional = (values.additionalInfo ?? "").trim();
  const description = [summary, businessProblem, additional].filter(Boolean).join("\n\n");

  return {
    id: slugId(channel.id, title),
    title,
    description,
    area: channel.defaultArea,
    sponsor,
    outcome: summary.slice(0, 120) || title,
    valueType: channel.defaultValueType,
    reach: { value: Number(values.reachValue) || 0, unit: (values.reachUnit ?? "users").trim() },
    effortTeamWeeks: Math.max(1, Number(values.effortTeamWeeks) || 1),
    deliveryConfidence: 0.8,
    valueConfidence: 0.8,
  };
}

export function requesterJson(channel: IntakeChannel, values: ChannelFormValues): string {
  return JSON.stringify(initiativeFromRequester(channel, values), null, 2);
}