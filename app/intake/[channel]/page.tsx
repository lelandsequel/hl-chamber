import { notFound } from "next/navigation";

import { channelById } from "@/lib/chamber/channels";

import { IntakeClient } from "./IntakeClient";

export default function IntakePage({ params }: { params: { channel: string } }) {
  const channel = channelById(params.channel);
  if (!channel) notFound();
  return <IntakeClient channel={channel} />;
}