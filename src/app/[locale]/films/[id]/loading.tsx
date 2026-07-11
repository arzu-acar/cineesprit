export default function FilmDetailLoading() {
  return (
    <div className="min-h-screen bg-ce-bg">
      <div className="h-[55vh] min-h-[360px] bg-ce-panel animate-pulse" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative -mt-40 mb-16 grid grid-cols-1 gap-10 md:grid-cols-[260px_1fr]">
          <div className="hidden md:block">
            <div className="aspect-[2/3] w-[260px] bg-ce-panel animate-pulse" />
          </div>
          <div className="pt-0 md:pt-32 space-y-4">
            <div className="h-4 w-32 bg-ce-panel animate-pulse" />
            <div className="h-14 w-3/4 bg-ce-panel animate-pulse" />
            <div className="h-4 w-1/2 bg-ce-panel animate-pulse" />
            <div className="h-24 w-full max-w-2xl bg-ce-panel animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
