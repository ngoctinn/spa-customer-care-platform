// src/components/common/DisplayCardSkeleton.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DisplayCardSkeletonProps {
  withDescription?: boolean;
}

export function DisplayCardSkeleton({
  withDescription = true,
}: DisplayCardSkeletonProps) {
  return (
    <Card className="flex w-full flex-col">
      <CardHeader className="p-0">
        <Skeleton className="h-48 w-full rounded-t-lg" />
      </CardHeader>
      <CardContent className="flex grow flex-col gap-3 pt-6">
        <Skeleton className="h-6 w-3/4" />
        {withDescription ? (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </>
        ) : null}
      </CardContent>
      <CardFooter>
        <Skeleton className="h-6 w-full" />
      </CardFooter>
    </Card>
  );
}
