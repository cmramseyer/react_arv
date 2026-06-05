import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrdenesPendientesFacturacion,
  facturarOrdenes,
} from "@/features/ordenes-fumigacion/api/ordenesFumigacionService";
import {
  getFacturasPago,
  marcarFacturaPagada,
} from "@/features/ordenes-fumigacion/api/facturasService";

export const facturacionQueryKey = (modoPago) => ["facturacion", modoPago];

const normalizarRespuesta = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
};

export function useFacturacionQuery(modoPago) {
  return useQuery({
    queryKey: facturacionQueryKey(modoPago),
    queryFn: modoPago ? getFacturasPago : getOrdenesPendientesFacturacion,
    select: normalizarRespuesta,
  });
}

export function useFacturacionMutation() {
  const queryClient = useQueryClient();

  const facturarMutation = useMutation({
    mutationFn: facturarOrdenes,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["facturacion"] });
    },
  });

  const marcarFacturaPagadaMutation = useMutation({
    mutationFn: ({ facturaId, fechaPago }) =>
      marcarFacturaPagada(facturaId, fechaPago),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["facturacion"] });
    },
  });

  return { facturarMutation, marcarFacturaPagadaMutation };
}
