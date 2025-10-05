// src/app/(public)/loading.tsx
import { DisplayCardSkeleton } from "@/components/common/DisplayCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div>
      <section className="relative flex h-[60vh] min-h-[400px] items-center justify-center bg-muted">
        <div className="absolute inset-0 bg-muted-foreground/40" />
        <div className="relative z-10 container mx-auto flex flex-col items-center gap-4 px-4 text-center">
          <Skeleton className="h-12 w-3/4 max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-2/3 max-w-xl" />
          <Skeleton className="mt-4 h-12 w-40" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <Skeleton className="mx-auto mb-6 h-10 w-72" />
        <Skeleton className="mx-auto mb-10 h-4 w-2/3 max-w-2xl" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <DisplayCardSkeleton key={`services-${index}`} />
          ))}
        </div>
      </div>

      <div className="border-b" />

      <div className="container mx-auto px-4 py-16">
        <Skeleton className="mx-auto mb-6 h-10 w-64" />
        <Skeleton className="mx-auto mb-10 h-4 w-2/3 max-w-2xl" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <DisplayCardSkeleton key={`plans-${index}`} />
          ))}
        </div>
      </div>

      <div className="border-b" />

      <div className="container mx-auto px-4 py-16">
        <Skeleton className="mx-auto mb-6 h-10 w-64" />
        <Skeleton className="mx-auto mb-10 h-4 w-2/3 max-w-2xl" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <DisplayCardSkeleton key={`products-${index}`} />
          ))}
        </div>
      </div>

      <div className="border-b" />

      <div className="container mx-auto px-4 py-16">
        <Skeleton className="mx-auto mb-6 h-10 w-72" />
        <Skeleton className="mx-auto mb-10 h-4 w-2/3 max-w-2xl" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <DisplayCardSkeleton key={`promotions-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
