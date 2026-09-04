import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_CARDS = [0, 1, 2];

export default function EstadisticaCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando estadísticas"
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <span className="sr-only">Cargando estadísticas...</span>
      {SKELETON_CARDS.map((card) => (
        <Card key={card} aria-hidden="true">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
