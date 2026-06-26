/** Home Lending intake channels — specialized front doors, one engine. */

export type ChannelId = "sales" | "risk" | "texas-heloc" | "msp-ops" | "general";

export type ChannelField = {
  key: string;
  label: string;
  kind: "text" | "textarea" | "number" | "date" | "select" | "email";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

export type IntakeChannel = {
  id: ChannelId;
  title: string;
  subtitle: string;
  tone: "sales" | "risk" | "strategy" | "ops" | "default";
  defaultValueType: string;
  defaultArea: string;
  mandateByDefault?: boolean;
  requesterFields: ChannelField[];
};

const REQUESTER_BASE: ChannelField[] = [
  { key: "submitterName", label: "Your name", kind: "text", required: true },
  { key: "submitterEmail", label: "Email", kind: "email", required: true },
  { key: "title", label: "Idea title", kind: "text", required: true },
  { key: "summary", label: "Summary", kind: "textarea", required: true, placeholder: "What are you asking for?" },
  { key: "businessProblem", label: "Business problem", kind: "textarea", required: true },
  { key: "additionalInfo", label: "Additional information", kind: "textarea" },
];

export const CHANNELS: IntakeChannel[] = [
  {
    id: "sales",
    title: "Sales & Growth",
    subtitle: "Revenue ideas from the field",
    tone: "sales",
    defaultValueType: "Direct Customer Revenue",
    defaultArea: "Sales",
    requesterFields: [
      ...REQUESTER_BASE.map((f) =>
        f.key === "title" ? { ...f, placeholder: "Correspondent pricing uplift" } : f,
      ),
    ],
  },
  {
    id: "risk",
    title: "Risk & Compliance",
    subtitle: "FHA credit box, mandates, regulatory",
    tone: "risk",
    defaultValueType: "Risk-Compliance",
    defaultArea: "Compliance",
    mandateByDefault: true,
    requesterFields: [
      ...REQUESTER_BASE.map((f) =>
        f.key === "title" ? { ...f, placeholder: "FHA DTI >50% credit box removal" } : f,
      ),
    ],
  },
  {
    id: "texas-heloc",
    title: "Texas HELOC / Strategy",
    subtitle: "Mission-scale product ideas",
    tone: "strategy",
    defaultValueType: "Strategic-Optionality",
    defaultArea: "Consumer Lending",
    requesterFields: [
      ...REQUESTER_BASE.map((f) =>
        f.key === "title" ? { ...f, placeholder: "Texas HELOC second-lien product" } : f,
      ),
    ],
  },
  {
    id: "msp-ops",
    title: "MSP / Data Ops",
    subtitle: "Configuration & servicing operations",
    tone: "ops",
    defaultValueType: "Direct Customer Service",
    defaultArea: "Servicing Operations",
    requesterFields: [
      ...REQUESTER_BASE.map((f) =>
        f.key === "title" ? { ...f, placeholder: "Private bank letter trigger update" } : f,
      ),
    ],
  },
  {
    id: "general",
    title: "General Idea",
    subtitle: "Any Home Lending request",
    tone: "default",
    defaultValueType: "Internal Enabler",
    defaultArea: "Home Lending",
    requesterFields: REQUESTER_BASE,
  },
];

export function channelById(id: string): IntakeChannel | undefined {
  return CHANNELS.find((c) => c.id === id);
}