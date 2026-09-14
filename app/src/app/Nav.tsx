import Link from "next/link";

export function Nav() {
  return (
    <nav className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 dark:border-neutral-800">
      <Link href="/" className="font-bold">
        FirstBite 🍪
      </Link>
      <div className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-300">
        <Link href="/create" className="hover:underline">
          Create
        </Link>
        <Link href="/history" className="hover:underline">
          Your Bites
        </Link>
      </div>
    </nav>
  );
}
