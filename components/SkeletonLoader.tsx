export default function SkeletonCard() {
  return (
    <div className="flex flex-col h-full">
      <div className="aspect-[2/3] rounded-lg skeleton" />
      <div className="mt-2.5 space-y-1.5">
        <div className="h-3 w-3/4 rounded skeleton" />
        <div className="h-2.5 w-1/3 rounded skeleton" />
      </div>
    </div>
  );
}
