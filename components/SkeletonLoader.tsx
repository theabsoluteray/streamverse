// Skeleton loader components for loading states

export default function SkeletonCard() {
  return (
    <div className="flex-shrink-0">
      <div className="w-full aspect-[2/3] rounded-xl skeleton" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3.5 skeleton rounded w-4/5" />
        <div className="h-3 skeleton rounded w-2/5" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative w-full h-[85vh] min-h-[500px] skeleton">
      <div className="absolute inset-0 gradient-bottom" />
      <div className="absolute bottom-20 left-8 md:left-16 space-y-4 max-w-lg">
        <div className="h-12 skeleton rounded-xl w-3/4" />
        <div className="h-4 skeleton rounded w-1/3" />
        <div className="h-16 skeleton rounded-xl w-full" />
        <div className="flex gap-3">
          <div className="h-12 w-36 skeleton rounded-xl" />
          <div className="h-12 w-28 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-48 h-72 skeleton rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="h-10 skeleton rounded-xl w-1/2" />
          <div className="h-4 skeleton rounded w-1/4" />
          <div className="h-24 skeleton rounded-xl w-full" />
          <div className="flex gap-3">
            <div className="h-12 w-36 skeleton rounded-xl" />
            <div className="h-12 w-28 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonEpisodeList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-2 rounded-lg">
          <div className="w-24 h-14 skeleton rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 skeleton rounded w-3/4" />
            <div className="h-3 skeleton rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
