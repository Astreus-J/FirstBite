import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          FirstBite <span aria-hidden>🍪</span>
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium text-muted">
          <Link href="/create" className="transition-colors hover:text-ink">
            Create
          </Link>
          <Link href="/history" className="transition-colors hover:text-ink">
            Your Bites
          </Link>
        </div>
      </nav>
    </header>
  );
}
