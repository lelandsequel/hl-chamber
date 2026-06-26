/** Home Lending mission backlogs — federated under centralized intake. */

export type MissionId =
  | "origination"
  | "servicing"
  | "risk-compliance"
  | "consumer-lending"
  | "data-platform"
  | "private-bank"
  | "strategy";

export type Mission = {
  id: MissionId;
  label: string;
  owner: string;
};

export const MISSIONS: Mission[] = [
  { id: "origination", label: "Origination & Sales", owner: "Portfolio Ops" },
  { id: "servicing", label: "Servicing Operations", owner: "MSP Ops" },
  { id: "risk-compliance", label: "Risk & Compliance", owner: "Risk PM" },
  { id: "consumer-lending", label: "Consumer Lending", owner: "Consumer PM" },
  { id: "data-platform", label: "Data & Platform", owner: "Platform PM" },
  { id: "private-bank", label: "Private Bank Lending", owner: "Private Bank PM" },
  { id: "strategy", label: "Strategy & North Star", owner: "Strategy Mgmt" },
];

export function missionById(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function defaultMissionForChannel(channel: string): MissionId {
  switch (channel) {
    case "sales":
      return "origination";
    case "risk":
      return "risk-compliance";
    case "texas-heloc":
      return "strategy";
    case "msp-ops":
      return "servicing";
    default:
      return "consumer-lending";
  }
}