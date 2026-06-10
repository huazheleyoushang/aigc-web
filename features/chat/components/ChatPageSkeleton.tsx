export function ChatPageSkeleton() {
  return (
    <div className="flex h-screen bg-white">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg-sidebar)] md:block">
        <div className="animate-pulse p-4 space-y-3">
          <div className="h-8 w-24 rounded bg-gray-200" />
          <div className="h-10 w-full rounded-lg bg-gray-200" />
          <div className="h-8 w-full rounded bg-gray-100" />
          <div className="h-8 w-full rounded bg-gray-100" />
        </div>
      </aside>
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
        </div>
        <div className="p-4">
          <div className="mx-auto h-14 max-w-3xl animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </main>
    </div>
  );
}
