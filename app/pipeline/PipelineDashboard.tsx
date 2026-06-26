"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { FundingPill } from "@/components/FundingPill";
import { ReceiptBar } from "@/components/ReceiptBar";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { downloadMarkdown, runChamberSpecViaApi, type ChamberSpecView } from "@/lib/chamber/client";
import type { ChamberInitiative } from "@/lib/chamber/types";

import { getPipeline, type PipelineItem } from "./actions";

export function PipelineDashboard({ initial }: { initial: Awaited<ReturnType<typeof getPipeline>> }) {
  const params = useSearchParams();
  const highlight = params.get("highlight");
  const [queue, setQueue] = useState(initial.queue);
  const [selected, setSelected] = useState<PipelineItem | null>(
    () => queue.find((q) => q.id === highlight) ?? null,
  );
  const [spec, setSpec] = useState<ChamberSpecView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [specPending, startSpec] = useTransition();

  function handleSpec(id: string) {
    setError(null);
    startSpec(async () => {
      try {
        const result = await runChamberSpecViaApi(id);
        setSpec(result);
        setSelected(queue.find((q) => q.id === id) ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Spec failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <p className="mt-1 text-sm text-muted">
          One queue. Every channel. Score → COSMIC spec → epic/story docs → STRATA audit.
        </p>
        <div className="mt-2 flex flex-wrap gap-4 font-mono text-xs text-muted">
          <span>
            capacity {initial.capacityUsed}/{initial.capacity}
          </span>
          <ReceiptBar label="ledger head" sha={initial.chainHead} />
          <span className={initial.verify.ok ? "text-funded" : "text-refused"}>
            chain {initial.verify.ok ? "✓" : "✗"}
          </span>
        </div>
      </header>

      <section className="space-y-2">
        {queue.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border p-3 ${
              selected?.id === item.id ? "border-accent bg-accent/5" : "border-border"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button type="button" onClick={() => setSelected(item)} className="text-left">
                <span className="font-mono text-xs text-muted">#{item._rank}</span>{" "}
                <span className="font-medium">{item.title}</span>
                {item._chamberChannel && (
                  <span className="ml-2 font-mono text-xs text-accent">{item._chamberChannel}</span>
                )}
              </button>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-accent">score {item._score}</span>
                <FundingPill funding={item._funding} />
                {item._funding === "FUNDED" && (
                  <button
                    type="button"
                    onClick={() => handleSpec(item.id)}
                    disabled={specPending}
                    className="rounded bg-accent/20 px-2 py-1 font-mono text-xs text-accent disabled:opacity-50"
                  >
                    {specPending ? "…" : "Run COSMIC"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {error && <div className="text-sm text-refused">{error}</div>}

      {selected && (
        <section className="rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold">Score receipt</h2>
          <ScoreBreakdown breakdown={selected._breakdown as Parameters<typeof ScoreBreakdown>[0]["breakdown"]} />
        </section>
      )}

      {spec && (
        <section className="space-y-4 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <h2 className="text-lg font-semibold">Chamber output — COSMIC + STRATA</h2>
          <p className="text-sm text-muted">
            {spec.ticketSlice.epicTitle} · {spec.ticketSlice.storyCount} stories · channel{" "}
            <span className="font-mono text-ink">{spec.channel}</span>
          </p>
          <div className="font-mono text-xs text-muted">
            AURORA: NO_OBJECTION={spec.cosmic.gate.summary.NO_OBJECTION} · REFUSE=
            {spec.cosmic.gate.summary.REFUSE} · STRATA{" "}
            {spec.strataAudit.refused ? "REFUSED" : `certified ${spec.strataAudit.speedup}×`}
          </div>
          <ReceiptBar label="COSMIC run" sha={spec.cosmic.runHash} />
          <ReceiptBar label="LUNA" sha={spec.cosmic.ledgerEntry.hash} seq={spec.cosmic.ledgerEntry.seq} />
          <ReceiptBar label="STRATA" sha={spec.strataAudit.queryHash} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => downloadMarkdown(`${spec.initiativeId}-epic-stories.md`, spec.docs.epicStories)}
              className="rounded bg-accent/20 px-3 py-1 font-mono text-xs text-accent"
            >
              epic-stories.md
            </button>
            <button
              type="button"
              onClick={() => downloadMarkdown(`${spec.initiativeId}-full-spec.md`, spec.docs.fullSpec)}
              className="rounded border border-border px-3 py-1 font-mono text-xs text-muted"
            >
              full-spec.md
            </button>
          </div>
          <details className="rounded border border-border p-3">
            <summary className="cursor-pointer font-mono text-xs text-muted">Preview epic-stories</summary>
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap font-mono text-xs">{spec.docs.epicStories}</pre>
          </details>
        </section>
      )}
    </div>
  );
}