import { Suspense } from "react";

import { IdeaRow } from "@/components/chamber/IdeaRow";
import { ReceiptBar } from "@/components/ReceiptBar";

import { getMeetings } from "./actions";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const data = await getMeetings();
  return (
    <Suspense fallback={<div className="text-muted">Loading…</div>}>
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Meetings</h1>
            <p className="mt-1 font-mono text-xs text-muted">{data.week}</p>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-xs text-muted">
            <span>
              capacity {data.capacityUsed}/{data.capacity}
            </span>
            <ReceiptBar label="ledger" sha={data.chainHead} />
          </div>
        </header>

        <section>
          <h2 className="font-mono text-xs uppercase text-accent">Wednesday — strategy gate</h2>
          <div className="mt-2 space-y-2">
            {data.wednesday.length ? (
              data.wednesday.map((idea) => <IdeaRow key={idea.id} idea={idea} />)
            ) : (
              <p className="text-sm text-muted">No items</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-mono text-xs uppercase text-accent">Thursday — scored review</h2>
          <div className="mt-2 space-y-2">
            {data.thursday.length ? (
              data.thursday.map((idea) => <IdeaRow key={idea.id} idea={idea} />)
            ) : (
              <p className="text-sm text-muted">No items</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-mono text-xs uppercase text-muted">Between meetings</h2>
          <div className="mt-2 space-y-2">
            {data.active.length ? (
              data.active.map((idea) => <IdeaRow key={idea.id} idea={idea} />)
            ) : (
              <p className="text-sm text-muted">No items</p>
            )}
          </div>
        </section>
      </div>
    </Suspense>
  );
}