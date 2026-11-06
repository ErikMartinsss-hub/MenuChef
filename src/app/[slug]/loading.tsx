export default function StorefrontLoading() {
  return (
    <div className="min-h-dvh bg-[#faf8f5]">
      <div className="h-16 border-b border-stone-200/70 bg-white" />
      <div className="h-52 animate-pulse bg-stone-300" />
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex gap-2 py-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-8 w-24 animate-pulse rounded-full bg-stone-200"
            />
          ))}
        </div>
        <div className="mt-6 space-y-2.5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex gap-3.5 rounded-2xl border border-stone-200/70 bg-white p-3"
            >
              <div className="h-24 w-24 animate-pulse rounded-xl bg-stone-200" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
                <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-stone-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
