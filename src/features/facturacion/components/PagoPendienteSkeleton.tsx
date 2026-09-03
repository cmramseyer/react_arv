import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_GROUPS = [0, 1];
const SKELETON_ORDERS = [0, 1];

export default function PagoPendienteSkeleton() {
  return (
    <div role="status" aria-label="Cargando facturas para pago" className="space-y-4">
      <span className="sr-only">Cargando facturas para pago...</span>
      {SKELETON_GROUPS.map((group) => (
        <Card key={group} className="w-full" aria-hidden="true">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {SKELETON_ORDERS.map((order) => (
              <div
                key={order}
                className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-1 flex-col gap-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <div className="rounded-md border bg-muted/40 p-3">
                  <Skeleton className="h-4 w-16" />
                  <div className="mt-2 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
