import type { Initiative } from "@/lib/agility/types";

import type { ChannelId } from "./channels";

/** Rob instant assessment — ops-filled fields that feed RICE+NPV. */
export type AssessmentFields = {
  reachValue: string;
  reachUnit: string;
  reachSource: string;
  effortTeamWeeks: string;
  revenueImpact?: string;
  revenueSource?: string;
  costSaveAnnual?: string;
  costSaveSource?: string;
  savingsEffectiveDate?: string;
  riskReduction?: string;
  mandateCitation?: string;
  solvableNearTerm: "yes" | "no" | "unknown";
  businessValueConfirmed: "yes" | "no" | "partial";
  valueConfidence: string;
  deliveryConfidence: string;
  notes?: string;
};

export const ASSESSMENT_FIELD_DEFS: Array<{
  key: keyof AssessmentFields;
  label: string;
  kind: "text" | "textarea" | "number" | "date" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
}> = [
  { key: "solvableNearTerm", label: "Solvable near term", kind: "select", required: true, options: [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "unknown", label: "Unknown" },
  ]},
  { key: "businessValueConfirmed", label: "Business value confirmed", kind: "select", required: true, options: [
    { value: "yes", label: "Yes" },
    { value: "partial", label: "Partial" },
    { value: "no", label: "No" },
  ]},
  { key: "reachValue", label: "Reach (annual)", kind: "number", required: true },
  { key: "reachUnit", label: "Reach unit", kind: "text", required: true },
  { key: "reachSource", label: "Reach source", kind: "text", required: true },
  { key: "effortTeamWeeks", label: "Effort (team-weeks)", kind: "number", required: true },
  { key: "revenueImpact", label: "Revenue impact ($/yr)", kind: "number" },
  { key: "revenueSource", label: "Revenue source", kind: "text" },
  { key: "costSaveAnnual", label: "Cost save ($/yr)", kind: "number" },
  { key: "costSaveSource", label: "Cost save source", kind: "text" },
  { key: "savingsEffectiveDate", label: "Savings effective date", kind: "date" },
  { key: "riskReduction", label: "Risk reduction ($)", kind: "number" },
  { key: "mandateCitation", label: "Mandate citation", kind: "text" },
  { key: "valueConfidence", label: "Value confidence (0–1)", kind: "number", required: true },
  { key: "deliveryConfidence", label: "Delivery confidence (0–1)", kind: "number", required: true },
  { key: "notes", label: "Assessment notes", kind: "textarea" },
];

export function mergeAssessmentIntoInitiative(
  base: Initiative,
  channel: ChannelId,
  assessment: AssessmentFields,
  mandateByDefault?: boolean,
): Initiative {
  const evidence: Record<string, string> = { ...base.evidence };
  if (assessment.reachSource?.trim()) evidence.reach = assessment.reachSource.trim();
  if (assessment.revenueSource?.trim()) evidence.revenue = assessment.revenueSource.trim();
  if (assessment.costSaveSource?.trim()) evidence.costSave = assessment.costSaveSource.trim();
  if (assessment.mandateCitation?.trim()) evidence.mandate = assessment.mandateCitation.trim();

  const merged: Initiative = {
    ...base,
    reach: {
      value: Number(assessment.reachValue) || 0,
      unit: (assessment.reachUnit ?? "users").trim(),
      source: assessment.reachSource?.trim(),
    },
    effortTeamWeeks: Math.max(1, Number(assessment.effortTeamWeeks) || 1),
    deliveryConfidence: Math.min(1, Math.max(0, Number(assessment.deliveryConfidence) || 0.8)),
    valueConfidence: Math.min(1, Math.max(0, Number(assessment.valueConfidence) || 0.8)),
    evidence,
  };

  const revenue = Number(assessment.revenueImpact);
  if (revenue > 0) merged.revenueImpact = revenue;

  const costSave = Number(assessment.costSaveAnnual);
  if (costSave > 0) {
    merged.costSaveAnnual = costSave;
    if (assessment.savingsEffectiveDate?.trim()) {
      merged.savingsEffectiveDate = assessment.savingsEffectiveDate.trim();
    }
  }

  const riskReduction = Number(assessment.riskReduction);
  if (riskReduction > 0) {
    merged.riskReduction = riskReduction;
    merged.pRisk = 0.6;
  }

  if (mandateByDefault || assessment.mandateCitation?.trim() || channel === "risk") {
    merged.mandate = true;
    merged.mandateCitation = assessment.mandateCitation?.trim() || base.mandateCitation || "Regulatory mandate";
  }

  if (assessment.solvableNearTerm === "no") {
    merged.deliveryConfidence = Math.min(merged.deliveryConfidence, 0.5);
  }
  if (assessment.businessValueConfirmed === "no") {
    merged.valueConfidence = Math.min(merged.valueConfidence, 0.5);
  }

  return merged;
}

export function assessmentComplete(fields: AssessmentFields): boolean {
  return Boolean(
    fields.reachValue &&
      fields.reachSource &&
      fields.reachUnit &&
      fields.effortTeamWeeks &&
      fields.valueConfidence &&
      fields.deliveryConfidence &&
      fields.solvableNearTerm &&
      fields.businessValueConfirmed,
  );
}