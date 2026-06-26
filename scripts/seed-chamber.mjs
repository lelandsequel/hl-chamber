#!/usr/bin/env node
/** Seed July 1 workflow demo items alongside engine initiatives. */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dataDir = process.env.LOOPER_DATA_DIR ?? path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "looper-northpole.db"));

function cohortWeek() {
  const d = new Date();
  const day = d.getUTCDay() || 7;
  const th = new Date(d);
  th.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(th.getFullYear(), 0, 1);
  const week = Math.ceil(((th - yearStart) / 86400000 + 1) / 7);
  return `${th.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

const week = cohortWeek();
const now = new Date().toISOString();

const DEMO = [
  {
    id: "HL-risk-fha-dti-demo",
    title: "FHA DTI >50% credit box removal",
    description: "Remove above-50% DTI cells per risk mandate.\n\nNon-discretionary credit box contract change.",
    area: "Compliance",
    sponsor: "Risk PM",
    outcome: "Remove above-50% DTI cells",
    valueType: "Risk-Compliance",
    mandate: true,
    mandateCitation: "FHA credit box contract",
    reach: { value: 12000, unit: "loans", source: "Risk portfolio" },
    effortTeamWeeks: 6,
    deliveryConfidence: 1,
    valueConfidence: 1,
    riskReduction: 4000000,
    pRisk: 0.8,
    _chamberChannel: "risk",
    _workflow: "scored",
    _cohortWeek: week,
    _submittedAt: now,
    _submitter: { name: "Jen K.", email: "jen@jpmc.demo" },
    _triageOwner: "Rob M.",
    _triagePool: "portfolio",
    _mission: "risk-compliance",
    _comms: [],
    _workflowLog: [],
  },
  {
    id: "HL-texas-heloc-demo",
    title: "Texas HELOC second-lien product",
    description: "Strategy bet for Texas HELOC second-lien positioning.",
    area: "Consumer Lending",
    sponsor: "Matt S.",
    outcome: "Texas HELOC second-lien",
    valueType: "Strategic-Optionality",
    reach: { value: 0, unit: "pending" },
    effortTeamWeeks: 1,
    deliveryConfidence: 0.5,
    valueConfidence: 0.5,
    _chamberChannel: "texas-heloc",
    _workflow: "submitted",
    _cohortWeek: week,
    _submittedAt: now,
    _submitter: { name: "Field RM", email: "rm@jpmc.demo" },
    _requesterFields: {
      title: "Texas HELOC second-lien product",
      summary: "Launch second-lien HELOC for Texas portfolio",
      businessProblem: "Competitive gap in Texas home equity",
    },
    _comms: [],
    _workflowLog: [],
  },
  {
    id: "HL-msp-ops-letter-demo",
    title: "Private bank letter trigger update",
    description: "Update letter triggers for private bank accounts.",
    area: "Servicing Operations",
    sponsor: "MSP Ops",
    outcome: "Letter trigger update",
    valueType: "Direct Customer Service",
    reach: { value: 0, unit: "pending" },
    effortTeamWeeks: 1,
    deliveryConfidence: 0.5,
    valueConfidence: 0.5,
    _chamberChannel: "msp-ops",
    _workflow: "triage",
    _cohortWeek: week,
    _submittedAt: now,
    _submitter: { name: "MSP Lead", email: "msp@jpmc.demo" },
    _triageOwner: "Portfolio Ops",
    _triagePool: "production",
    _mission: "servicing",
    _comms: [],
    _workflowLog: [],
  },
];

const insert = db.prepare(
  `INSERT INTO initiatives (id, payload) VALUES (?, ?)
   ON CONFLICT(id) DO UPDATE SET payload = excluded.payload`,
);

for (const item of DEMO) {
  insert.run(item.id, JSON.stringify(item));
}

console.log(`seeded ${DEMO.length} chamber workflow demos (${week})`);
db.close();