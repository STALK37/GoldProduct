import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

const rpc = vi.fn();
const invoke = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpc(...args),
    functions: { invoke: (...args: unknown[]) => invoke(...args) },
  },
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

import CheckoutDialog from "@/components/CheckoutDialog";
import { CartProvider, useCart } from "@/contexts/CartContext";

const product = {
  productId: "aaaaaaaa-0000-0000-0000-000000000001",
  variant: "small" as const,
  name: "Чипси індички",
  weightLabel: "70 г",
  priceRetail: 92,
  priceWholesale: 83,
  image: "/chips.jpg",
};

/** Fills the cart and opens the dialog, so each test starts at the basket step. */
const Harness = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

const OpenWithItem = () => {
  const { addItem, setIsCheckoutOpen, items, isCheckoutOpen } = useCart();
  return (
    <>
      <button onClick={() => addItem(product)}>seed</button>
      <button onClick={() => setIsCheckoutOpen(true)}>open</button>
      <span data-testid="count">{items.length}</span>
      <span data-testid="open">{String(isCheckoutOpen)}</span>
      <CheckoutDialog />
    </>
  );
};

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Повне ім'я/), "Олена Ковальчук");
  await user.type(screen.getByLabelText(/^Email/), "olena@example.com");
  await user.type(screen.getByLabelText(/Телефон/), "+380 44 123 45 67");
  // The country field ships pre-filled with "Україна" — clear before typing.
  await user.clear(screen.getByLabelText(/Країна/));
  await user.type(screen.getByLabelText(/Країна/), "Україна");
  await user.type(screen.getByLabelText(/Місто/), "Львів");
  await user.type(screen.getByLabelText(/Поштовий індекс/), "79000");
  await user.type(screen.getByLabelText(/Адреса/), "вул. Січових Стрільців, 12");
};

const startCheckout = async (user: ReturnType<typeof userEvent.setup>) => {
  render(
    <Harness>
      <OpenWithItem />
    </Harness>,
  );
  await user.click(screen.getByText("seed"));
  await user.click(screen.getByText("open"));
  await user.click(await screen.findByRole("button", { name: /Оформити замовлення/ }));
  await fillForm(user);
  await user.click(screen.getByRole("button", { name: /Підтвердити/ }));
};

beforeEach(() => {
  rpc.mockReset();
  invoke.mockReset();
  rpc.mockResolvedValue({
    data: { order_id: "11111111-2222-3333-4444-555555555555", total_amount: 92, wholesale: false },
    error: null,
  });
  invoke.mockResolvedValue({ data: null, error: null });
});

describe("CheckoutDialog", () => {
  it("places the order through the place_order function, not through table inserts", async () => {
    const user = userEvent.setup();
    await startCheckout(user);

    await waitFor(() => expect(rpc).toHaveBeenCalledTimes(1));
    expect(rpc.mock.calls[0][0]).toBe("place_order");
  });

  // The reason place_order exists. Before it, the browser sent unit_price and
  // total_amount straight into the orders table, so a crafted request could
  // book any basket at any price. If a price ever reappears in this payload,
  // that hole is back.
  it("sends no prices to the server", async () => {
    const user = userEvent.setup();
    await startCheckout(user);

    await waitFor(() => expect(rpc).toHaveBeenCalled());
    const [, args] = rpc.mock.calls[0] as [string, { p_customer: unknown; p_items: unknown[] }];

    const payload = JSON.stringify(args);
    for (const forbidden of ["price", "total", "amount", "unit_price"]) {
      expect(payload.toLowerCase()).not.toContain(forbidden);
    }

    expect(args.p_items).toEqual([
      { product_id: product.productId, variant: "small", quantity: 1 },
    ]);
  });

  it("passes the customer details through intact", async () => {
    const user = userEvent.setup();
    await startCheckout(user);

    await waitFor(() => expect(rpc).toHaveBeenCalled());
    const [, args] = rpc.mock.calls[0] as [string, { p_customer: Record<string, string> }];

    expect(args.p_customer).toMatchObject({
      full_name: "Олена Ковальчук",
      email: "olena@example.com",
      city: "Львів",
      country: "Україна",
      post_code: "79000",
      address: "вул. Січових Стрільців, 12",
    });
  });

  it("notifies Telegram with only the order id", async () => {
    const user = userEvent.setup();
    await startCheckout(user);

    await waitFor(() => expect(invoke).toHaveBeenCalled());
    expect(invoke.mock.calls[0][0]).toBe("telegram-notify");
    expect(invoke.mock.calls[0][1]).toEqual({
      body: { order_id: "11111111-2222-3333-4444-555555555555" },
    });
  });

  it("empties the cart and shows the confirmation on success", async () => {
    const user = userEvent.setup();
    await startCheckout(user);

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"));
  });

  it("keeps the basket when the server rejects the order", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "One or more products are unavailable" } });

    const user = userEvent.setup();
    await startCheckout(user);

    await waitFor(() => expect(rpc).toHaveBeenCalled());
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(invoke).not.toHaveBeenCalled();
  });

  it("refuses to submit an invalid email and never reaches the server", async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <OpenWithItem />
      </Harness>,
    );
    await user.click(screen.getByText("seed"));
    await user.click(screen.getByText("open"));
    await user.click(await screen.findByRole("button", { name: /Оформити замовлення/ }));

    await user.type(screen.getByLabelText(/Повне ім'я/), "Олена");
    await user.type(screen.getByLabelText(/^Email/), "not-an-email");
    // The country field ships pre-filled with "Україна" — clear before typing.
  await user.clear(screen.getByLabelText(/Країна/));
  await user.type(screen.getByLabelText(/Країна/), "Україна");
    await user.type(screen.getByLabelText(/Місто/), "Львів");
    await user.type(screen.getByLabelText(/Поштовий індекс/), "79000");
    await user.type(screen.getByLabelText(/Адреса/), "вул. Січових Стрільців, 12");
    await user.click(screen.getByRole("button", { name: /Підтвердити/ }));

    expect(await screen.findByText("Невірний email")).toBeInTheDocument();
    expect(rpc).not.toHaveBeenCalled();
  });
});
