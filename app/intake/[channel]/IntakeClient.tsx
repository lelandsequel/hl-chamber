"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ChannelForm } from "@/components/chamber/ChannelForm";
import { submitIntakeViaApi } from "@/lib/chamber/client";
import type { IntakeChannel } from "@/lib/chamber/channels";

export function IntakeClient({ channel }: { channel: IntakeChannel }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string[] | null>(null);
  const [pending, start] = useTransition();

  function handleSubmit(values: Record<string, string>) {
    setError(null);
    setRefusal(null);
    start(async () => {
      try {
        const result = await submitIntakeViaApi(channel.id, values);
        router.push(`/idea/${result.initiativeId}`);
      } catch (e) {
        const err = e as Error & { cadmusErrors?: string[] };
        if (err.cadmusErrors?.length) setRefusal(err.cadmusErrors);
        else setError(err.message ?? "Submit failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="font-mono text-xs text-muted hover:text-accent">
          ← Intake
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{channel.title}</h1>
      </div>

      <section className="rounded-lg border border-border p-4">
        <ChannelForm channel={channel} onSubmit={handleSubmit} pending={pending} />
      </section>

      {refusal && (
        <div className="rounded border border-refused/40 bg-refused/10 p-4 text-sm text-refused">
          <ul className="list-inside list-disc">
            {refusal.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {error && <div className="rounded border border-refused/40 bg-refused/10 p-4 font-mono text-sm text-refused">{error}</div>}
    </div>
  );
}