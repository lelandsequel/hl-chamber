"use client";

import { useState } from "react";

import type { IntakeChannel } from "@/lib/chamber/channels";

import { FieldForm } from "./FieldForm";

type Props = {
  channel: IntakeChannel;
  onSubmit: (values: Record<string, string>) => void;
  pending: boolean;
};

export function ChannelForm({ channel, onSubmit, pending }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-4"
    >
      <FieldForm fields={channel.requesterFields} values={values} onChange={(k, v) => setValues((p) => ({ ...p, [k]: v }))} />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-accent/25 px-4 py-2 font-mono text-sm text-accent hover:bg-accent/35 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}