import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

import ProductoForm from "@/components/ProductoForm";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { setupServer } from 'msw/node'
import { productoHandlers } from '@/features/productos/mocks/productoHandlers'
 
export const server = setupServer(...productoHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
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
  });
});
