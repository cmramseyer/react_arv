import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = [0, 1, 2, 3, 4];
const SKELETON_CARDS = [0, 1, 2];

export default function LoteListSkeleton() {
  return (
    <div role="status" aria-label="Cargando lotes" className="space-y-4">
      <span className="sr-only">Cargando lotes...</span>
      <div className="hidden md:block" aria-hidden="true">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Propietario</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Hectareas</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKELETON_ROWS.map((row) => (
              <TableRow key={row}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-7 w-14" />
                    <Skeleton className="h-7 w-18" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-4 md:hidden" aria-hidden="true">
        {SKELETON_CARDS.map((card) => (
          <Card key={card}>
            <CardHeader className="pb-2">
              <Skeleton className="mx-auto h-5 w-32" />
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-center gap-2">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-7 w-14" />
              <Skeleton className="h-7 w-18" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
