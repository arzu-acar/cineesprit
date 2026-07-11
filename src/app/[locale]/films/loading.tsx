export default function FilmsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 h-8 w-40 bg-ce-panel animate-pulse" />
      <div className="mb-10 h-10 w-full bg-ce-panel animate-pulse" />
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[2/3] w-full bg-ce-panel animate-pulse" />
            <div className="mt-3 h-4 w-3/4 bg-ce-panel animate-pulse" />
            <div className="mt-1 h-3 w-1/4 bg-ce-panel animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
