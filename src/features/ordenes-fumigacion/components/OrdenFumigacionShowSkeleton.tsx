import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdenFumigacionShowSkeleton() {
  return (
    <div role="status" aria-label="Cargando orden" className="space-y-4">
      <span className="sr-only">Cargando orden...</span>
      <Card className="w-full" aria-hidden="true">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-6 w-52" />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Skeleton className="h-9 w-24" />
        </CardFooter>
      </Card>
      <CardFooter className="flex flex-wrap gap-2" aria-hidden="true">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </div>
  );
}
