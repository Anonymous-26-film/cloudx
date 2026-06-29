import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("flex-shrink-0 w-40 sm:w-44 md:w-52", className)}>
      <Skeleton className="aspect-[2/3] rounded-md w-full" />
      <div className="mt-2 space-y-1.5 px-0.5">
        <Skeleton className="h-3.5 w-4/5 rounded" />
        <Skeleton className="h-2.5 w-2/5 rounded" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="mb-8">
      <Skeleton className="h-6 w-48 mb-4 rounded" />
      <div className="flex gap-8 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative w-full aspect-[21/9] min-h-[50vh]">
      <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      <div className="absolute bottom-16 left-16 space-y-4">
        <Skeleton className="h-12 w-80 rounded" />
        <Skeleton className="h-4 w-96 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-11 w-32 rounded-md" />
          <Skeleton className="h-11 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] rounded-md w-full" />
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-3.5 w-4/5 rounded" />
            <Skeleton className="h-3 w-2/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div>
      <Skeleton className="w-full h-[50vh] rounded-none" />
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        <Skeleton className="hidden md:block w-64 h-96 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-3/4 rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
}
