import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_GROUPS = [0, 1];
const SKELETON_ORDERS = [0, 1];

export default function FacturaPendienteSkeleton() {
  return (
    <div role="status" aria-label="Cargando facturación pendiente" className="space-y-4">
      <span className="sr-only">Cargando facturación pendiente...</span>
      <div className="space-y-2" aria-hidden="true">
        <Skeleton className="h-4 w-48" />
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      {SKELETON_GROUPS.map((group) => (
        <Card key={group} className="w-full" aria-hidden="true">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-6 w-44" />
          </CardHeader>
          <CardContent className="space-y-3">
            {SKELETON_ORDERS.map((order) => (
              <div
                key={order}
                className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row md:gap-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-36" />
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
