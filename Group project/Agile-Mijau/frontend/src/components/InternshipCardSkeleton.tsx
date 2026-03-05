import { Skeleton } from '@/components/ui/skeleton';

export function InternshipCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Company name */}
        <Skeleton className="h-4 w-1/2 mb-4" />

        {/* Description lines */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Details with icons */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}
