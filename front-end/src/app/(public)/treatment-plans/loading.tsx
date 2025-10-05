// src/app/(public)/treatment-plans/loading.tsx
import { DisplayCardSkeleton } from "@/components/common/DisplayCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function TreatmentPlansLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <Skeleton className="mx-auto mb-4 h-10 w-72" />
        <Skeleton className="mx-auto h-4 w-2/3 max-w-2xl" />
      </header>

      <div className="mx-auto mb-8 max-w-md">
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <DisplayCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
