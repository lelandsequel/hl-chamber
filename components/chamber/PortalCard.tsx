import Link from "next/link";

import type { IntakeChannel } from "@/lib/chamber/channels";

const toneBorder: Record<IntakeChannel["tone"], string> = {
  sales: "hover:border-funded/50",
  risk: "hover:border-refused/50",
  strategy: "hover:border-accent/60",
  ops: "hover:border-benched/50",
  default: "hover:border-accent/40",
};

export function PortalCard({ channel }: { channel: IntakeChannel }) {
  return (
    <Link
      href={`/intake/${channel.id}`}
      className={`block rounded-xl border border-border bg-black/25 p-5 transition ${toneBorder[channel.tone]}`}
    >
      <div className="font-mono text-xs uppercase tracking-wide text-accent">{channel.subtitle}</div>
      <h2 className="mt-2 text-lg font-semibold">{channel.title}</h2>
    </Link>
  );
}