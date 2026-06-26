"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FundingPill } from "@/components/FundingPill";
import { ReceiptBar } from "@/components/ReceiptBar";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { FieldForm } from "@/components/chamber/FieldForm";
import { WorkflowBadge } from "@/components/chamber/WorkflowBadge";
import { ASSESSMENT_FIELD_DEFS, type AssessmentFields } from "@/lib/chamber/assessment";
import {
  downloadMarkdown,
  downloadText,
  graduateToJiraViaApi,
  runAssessmentViaApi,
  runChamberSpecViaApi,
  workflowAction,
  type ChamberSpecView,
} from "@/lib/chamber/client";
import { MISSIONS } from "@/lib/chamber/missions";
import type { ChamberInitiative } from "@/lib/chamber/types";
import { canTransition, type WorkflowState } from "@/lib/chamber/workflow";

type Props = {
  initial: NonNullable<Awaited<ReturnType<typeof import("./actions").getIdea>>>;
};

const fieldClass =
  "mt-1 w-full rounded border border-border bg-black/30 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

export function IdeaWorkbench({ initial }: Props) {
  const router = useRouter();
  const [idea, setIdea] = useState(initial.idea);
  const [spec, setSpec] = useState<ChamberSpecView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [actor, setActor] = useState("ops");
  const [triageOwner, setTriageOwner] = useState(idea._triageOwner ?? "");
  const [triagePool, setTriagePool] = useState<"portfolio" | "production" | "strategy">(
    idea._triagePool ?? "portfolio",
  );
  const [mission, setMission] = useState(idea._mission ?? "");
  const [assessment, setAssessment] = useState<Record<string, string>>(() => {
    const a = idea._assessment;
    if (!a) {
      return {
        reachUnit: idea._chamberChannel === "risk" ? "loans" : "customers",
        valueConfidence: "0.8",
        deliveryConfidence: "0.8",
        effortTeamWeeks: "8",
        solvableNearTerm: "yes",
        businessValueConfirmed: "yes",
      };
    }
    return Object.fromEntries(Object.entries(a).map(([k, v]) => [k, String(v ?? "")]));
  });

  const state = (idea._workflow ?? "submitted") as WorkflowState;

  function act(action: Parameters<typeof workflowAction>[1], extra: Record<string, unknown> = {}) {
    setError(null);
    start(async () => {
      try {
        const updated = await workflowAction(idea.id, action, { actor, ...extra });
        setIdea(updated);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  function runScore() {
    setError(null);
    start(async () => {
      try {
        const updated = await runAssessmentViaApi(idea.id, assessment as AssessmentFields, actor);
        setIdea(updated);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Score failed");
      }
    });
  }

  function runSpec() {
    setError(null);
    start(async () => {
      try {
        const result = await runChamberSpecViaApi(idea.id);
        setSpec(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Spec failed");
      }
    });
  }

  function graduate() {
    setError(null);
    start(async () => {
      try {
        const result = await graduateToJiraViaApi(idea.id, actor);
        if (result.initiative) setIdea(result.initiative);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Graduation failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{idea.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <WorkflowBadge state={state} />
            {idea._funding && <FundingPill funding={idea._funding} />}
            {idea._score != null && <span className="font-mono text-sm text-accent">score {idea._score}</span>}
            {idea._rank != null && <span className="font-mono text-xs text-muted">#{idea._rank}</span>}
          </div>
        </div>
        <div className="font-mono text-xs text-muted">
          <div>{idea.id}</div>
          <div>{idea._cohortWeek}</div>
        </div>
      </header>

      {error && <div className="rounded border border-refused/40 bg-refused/10 p-3 text-sm text-refused">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="font-mono text-xs uppercase text-muted">Requester</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted">Name</dt>
              <dd>{idea._submitter?.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd>{idea._submitter?.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Summary</dt>
              <dd className="whitespace-pre-wrap">{idea._requesterFields?.summary}</dd>
            </div>
            <div>
              <dt className="text-muted">Problem</dt>
              <dd className="whitespace-pre-wrap">{idea._requesterFields?.businessProblem}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h2 className="font-mono text-xs uppercase text-muted">Ops</h2>
          <label className="mt-3 block font-mono text-[10px] uppercase text-muted">Actor</label>
          <input className={fieldClass} value={actor} onChange={(e) => setActor(e.target.value)} />
          <div className="mt-4 flex flex-wrap gap-2">
            {canTransition(state, "open_strategy_review") && (
              <ActionBtn pending={pending} onClick={() => act("open_strategy_review")}>
                Open strategy review
              </ActionBtn>
            )}
            {canTransition(state, "align_strategy") && (
              <ActionBtn pending={pending} onClick={() => act("align_strategy")}>
                Strategy aligned
              </ActionBtn>
            )}
            {canTransition(state, "close_not_aligned") && (
              <ActionBtn pending={pending} onClick={() => act("close_not_aligned")} danger>
                Close — not aligned
              </ActionBtn>
            )}
          </div>
        </div>
      </section>

      {(state === "strategy_aligned" || state === "triage") && (
        <section className="rounded-lg border border-border p-4">
          <h2 className="font-mono text-xs uppercase text-muted">Triage</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="font-mono text-[10px] uppercase text-muted">Owner</label>
              <input className={fieldClass} value={triageOwner} onChange={(e) => setTriageOwner(e.target.value)} />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted">Pool</label>
              <select className={fieldClass} value={triagePool} onChange={(e) => setTriagePool(e.target.value as typeof triagePool)}>
                <option value="portfolio">Portfolio</option>
                <option value="production">Production</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted">Mission</label>
              <select className={fieldClass} value={mission} onChange={(e) => setMission(e.target.value)}>
                <option value="">—</option>
                {MISSIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {canTransition(state, "assign_triage") && (
            <ActionBtn
              className="mt-4"
              pending={pending}
              disabled={!triageOwner.trim()}
              onClick={() =>
                act("assign_triage", { triageOwner, triagePool, mission: mission || undefined })
              }
            >
              Assign triage
            </ActionBtn>
          )}
        </section>
      )}

      {(state === "triage" || state === "assessment" || state === "scored") && (
        <section className="rounded-lg border border-border p-4">
          <h2 className="font-mono text-xs uppercase text-muted">Instant assessment</h2>
          <div className="mt-3">
            <FieldForm
              fields={ASSESSMENT_FIELD_DEFS.map((f) => ({
                key: f.key,
                label: f.label,
                kind: f.kind,
                required: f.required,
                options: f.options,
              }))}
              values={assessment}
              onChange={(k, v) => setAssessment((p) => ({ ...p, [k]: v }))}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {canTransition(state, "start_assessment") && (
              <ActionBtn pending={pending} onClick={() => act("start_assessment")}>
                Start assessment
              </ActionBtn>
            )}
            {(state === "assessment" || state === "triage") && (
              <ActionBtn pending={pending} onClick={runScore}>
                Run score
              </ActionBtn>
            )}
            {canTransition(state, "route_strategy_track") && (
              <ActionBtn pending={pending} onClick={() => act("route_strategy_track")}>
                Strategy track
              </ActionBtn>
            )}
          </div>
        </section>
      )}

      {state === "scored" && (
        <section className="rounded-lg border border-border p-4">
          <h2 className="font-mono text-xs uppercase text-muted">Thursday — mission assignment</h2>
          <select className={`${fieldClass} max-w-md`} value={mission} onChange={(e) => setMission(e.target.value)}>
            {MISSIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {canTransition(state, "assign_mission") && (
            <ActionBtn className="mt-4" pending={pending} onClick={() => act("assign_mission", { mission })}>
              Assign mission
            </ActionBtn>
          )}
          {idea._breakdown != null ? (
            <div className="mt-4">
              <ScoreBreakdown breakdown={idea._breakdown as Parameters<typeof ScoreBreakdown>[0]["breakdown"]} />
            </div>
          ) : null}
        </section>
      )}

      {state === "assigned" && (
        <section className="rounded-lg border border-accent/30 bg-accent/5 p-4">
          <h2 className="font-mono text-xs uppercase text-muted">Graduate — internal handoff</h2>
          <p className="mt-2 text-sm text-muted">
            Mission: {MISSIONS.find((m) => m.id === idea._mission)?.label ?? idea._mission}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionBtn pending={pending} onClick={runSpec} disabled={idea._funding !== "FUNDED"}>
              Run COSMIC
            </ActionBtn>
            <ActionBtn pending={pending} onClick={graduate} disabled={idea._funding !== "FUNDED"}>
              Graduate to backlog
            </ActionBtn>
          </div>
          {idea._funding !== "FUNDED" && (
            <p className="mt-2 text-xs text-muted">Benched items do not graduate to Jira.</p>
          )}
        </section>
      )}

      {spec && (
        <section className="rounded-lg border border-border p-4">
          <h2 className="font-mono text-xs uppercase text-muted">Handoff packet</h2>
          <p className="mt-2 text-sm">
            {spec.ticketSlice.epicTitle} · {spec.ticketSlice.storyCount} stories
          </p>
          <ReceiptBar label="COSMIC" sha={spec.cosmic.runHash} />
          <ReceiptBar label="STRATA" sha={spec.strataAudit.queryHash} />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => downloadMarkdown(`${idea.id}-epic-stories.md`, spec.docs.epicStories)}
              className="rounded bg-accent/20 px-3 py-1 font-mono text-xs text-accent"
            >
              epic-stories
            </button>
            <button
              type="button"
              onClick={() => downloadMarkdown(`${idea.id}-full-spec.md`, spec.docs.fullSpec)}
              className="rounded border border-border px-3 py-1 font-mono text-xs text-muted"
            >
              full-spec
            </button>
          </div>
        </section>
      )}

      {(idea._comms?.length ?? 0) > 0 && (
        <section className="rounded-lg border border-border p-4">
          <h2 className="font-mono text-xs uppercase text-muted">Comms</h2>
          <div className="mt-3 space-y-3">
            {idea._comms!.map((c) => (
              <div key={c.id} className="rounded border border-border/60 p-3">
                <div className="flex justify-between gap-2 font-mono text-[10px] text-muted">
                  <span>{c.kind}</span>
                  <span>{c.sentAt.slice(0, 10)}</span>
                </div>
                <div className="mt-1 text-sm font-medium">{c.subject}</div>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-muted">{c.body}</pre>
                <button
                  type="button"
                  className="mt-2 font-mono text-[10px] text-accent"
                  onClick={() => downloadText(`${c.id}.txt`, `${c.subject}\n\n${c.body}`)}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {initial.chainReceipts && initial.chainReceipts.length > 0 && (
        <section className="rounded-lg border border-border p-4">
          <h2 className="font-mono text-xs uppercase text-muted">Receipts</h2>
          <div className="mt-2 space-y-1">
            {initial.chainReceipts.map((r) => (
              <ReceiptBar key={r.seq} label={r.kind} sha={r.sha} seq={r.seq} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  pending,
  disabled,
  danger,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending?: boolean;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={pending || disabled}
      onClick={onClick}
      className={`rounded px-3 py-1.5 font-mono text-xs disabled:opacity-50 ${
        danger ? "border border-refused/40 text-refused" : "bg-accent/20 text-accent"
      } ${className}`}
    >
      {pending ? "…" : children}
    </button>
  );
}