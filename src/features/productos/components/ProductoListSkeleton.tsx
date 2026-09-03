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

export default function ProductoListSkeleton() {
  return (
    <div role="status" aria-label="Cargando productos">
      <span className="sr-only">Cargando productos...</span>
      <Table aria-hidden="true">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Unidad</TableHead>
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
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
