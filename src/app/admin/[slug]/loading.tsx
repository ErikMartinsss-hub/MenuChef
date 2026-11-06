export default function KitchenLoading() {
  return (
    <div className="min-h-dvh bg-[#0b0a09]">
      <div className="h-1 bg-orange-500" />
      <div className="border-b border-white/10 bg-stone-950 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
            <div className="space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-2.5 w-24 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-8 w-24 animate-pulse rounded-lg bg-white/5" />
        </div>
        <div className="mx-auto mt-4 flex max-w-[1500px] gap-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-8 w-24 animate-pulse rounded-lg bg-white/5"
            />
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-[1500px] gap-3.5 px-4 py-6 sm:px-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
          />
        ))}
      </div>
    </div>
  );
}
