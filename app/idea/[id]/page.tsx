import Link from "next/link";
import { notFound } from "next/navigation";

import { IdeaWorkbench } from "./IdeaWorkbench";
import { getIdea } from "./actions";

export const dynamic = "force-dynamic";

export default async function IdeaPage({ params }: { params: { id: string } }) {
  const data = await getIdea(params.id);
  if (!data) notFound();

  return (
    <div className="space-y-4">
      <Link href="/queue" className="font-mono text-xs text-muted hover:text-accent">
        ← Queue
      </Link>
      <IdeaWorkbench initial={data} />
    </div>
  );
}