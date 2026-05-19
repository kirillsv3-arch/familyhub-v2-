'use client';

export function ShoppingListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-1/4 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 h-80" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              <div className="space-y-1">
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
              </div>
            </div>
            <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
