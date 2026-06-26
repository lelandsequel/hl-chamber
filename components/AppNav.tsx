import Link from "next/link";

const links = [
  { href: "/", label: "Intake" },
  { href: "/meetings", label: "Meetings" },
  { href: "/queue", label: "Queue" },
] as const;

export function AppNav() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="font-mono text-sm text-muted">
          Home Lending <span className="text-accent">Chamber</span>
        </div>
        <nav className="flex gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="font-mono text-sm text-muted transition hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}