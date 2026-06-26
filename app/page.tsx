import { PortalCard } from "@/components/chamber/PortalCard";
import { CHANNELS } from "@/lib/chamber/channels";

export default function ChamberHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Intake</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {CHANNELS.map((c) => (
          <PortalCard key={c.id} channel={c} />
        ))}
      </div>
    </div>
  );
}