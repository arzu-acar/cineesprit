export default function FestivalsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 h-8 w-48 bg-ce-panel animate-pulse" />
      <div className="mb-10 h-10 w-full max-w-sm bg-ce-panel animate-pulse" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[140px] bg-ce-panel animate-pulse" />
        ))}
      </div>
    </div>
  );
}
