import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

import ProductoForm from '@/features/productos/components/ProductoForm'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { setupServer } from 'msw/node'
import { productoHandlers, resetProductoMocks } from '@/features/productos/mocks/productoHandlers'
 
export const server = setupServer(...productoHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetProductoMocks();
});
afterAll(() => server.close());

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (ui, queryClient = createQueryClient()) => {
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  };
};

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe("ProductoForm", () => {
  describe("Edit mode", () => {
    let user;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it("renders form with product data", async () => {
      const queryClient = createQueryClient();

      renderWithQueryClient(
        <MemoryRouter>
          <ProductoForm formAction="edit" id="1" />
        </MemoryRouter>,
        queryClient,
      );

      expect(await screen.findByDisplayValue("Roundup")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Agroquímico")).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByRole("combobox")).toHaveTextContent("Kilogramos");
      });
      expect(screen.getByRole("button", { name: /actualizar/i })).toBeInTheDocument();
    });

    it("updates a product and navigates to products page", async () => {
      const queryClient = createQueryClient();

      renderWithQueryClient(
        <MemoryRouter initialEntries={["/productos/1/edit"]}>
          <Routes>
            <Route path="/productos/1/edit" element={<ProductoForm formAction="edit" id="1" />} />
            <Route path="/productos" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>,
        queryClient,
      );

      const nombreInput = await screen.findByDisplayValue("Roundup");
      await waitFor(() => {
        expect(screen.getByRole("combobox")).toHaveTextContent("Kilogramos");
      });
      await user.clear(nombreInput);
      await user.type(nombreInput, "Roundup actualizado");
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Litros" }));
      await user.click(screen.getByRole("button", { name: /actualizar/i }));

      expect(await screen.findByTestId("location")).toHaveTextContent("/productos");
    });

  });

  describe("Create mode", () => {
    let user;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it("renders form with product data", async () => {
      const queryClient = createQueryClient();

      renderWithQueryClient(
        <MemoryRouter>
          <ProductoForm formAction="create" />
        </MemoryRouter>,
        queryClient,
      );

      expect(await screen.getByLabelText(/nombre/i)).toHaveValue("");
      expect(await screen.getByLabelText(/tipo de producto/i)).toHaveValue("");
      await waitFor(() => {
        expect(screen.getByRole("combobox")).toHaveValue("");
      });
      expect(screen.getByRole("button", { name: /guardar/i })).toBeInTheDocument();
    });

    it("validates form data", async () => {
      const queryClient = createQueryClient();

      renderWithQueryClient(
        <MemoryRouter>
          <ProductoForm formAction="create" />
        </MemoryRouter>,
        queryClient,
      );

    await user.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('El tipo de producto es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('La unidad de medida es obligatoria')).toBeInTheDocument()

    });

    it("creates a product and calls onSuccess", async () => {
      const queryClient = createQueryClient();
      const onSuccess = vi.fn();

      renderWithQueryClient(
        <MemoryRouter>
          <ProductoForm formAction="create" onSuccess={onSuccess} />
        </MemoryRouter>,
        queryClient,
      );

      await user.type(screen.getByLabelText(/nombre/i), "Glifosato");
      await user.type(screen.getByLabelText(/tipo de producto/i), "Agroquímico");
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Litros" }));
      const submitButton = screen.getByRole("button", { name: /guardar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });
});
