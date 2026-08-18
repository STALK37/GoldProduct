// Sends the shop owner a Telegram message when an order is placed.
//
// The caller supplies nothing but an order id. Everything in the message is
// read back from the database with the service-role key, so a hostile caller
// cannot put text of its own choosing into the owner's Telegram channel -- at
// worst it can re-send a notification for an order whose UUID it already knows.
//
// Secrets (never in .env, never in the bundle):
//   TELEGRAM_BOT_TOKEN  from @BotFather
//   TELEGRAM_CHAT_ID    the chat or channel to post to
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Telegram MarkdownV1 chokes on unescaped markup in user-supplied values. */
const clean = (value: unknown) =>
  String(value ?? "").replace(/[*_`[\]]/g, "").slice(0, 200);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set");
    return json({ error: "Telegram is not configured" }, 500);
  }

  try {
    const { order_id } = await req.json();

    if (typeof order_id !== "string" || !UUID_RE.test(order_id)) {
      return json({ error: "A valid order_id is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "id, total_amount, created_at, " +
          "customers ( full_name, email, phone, city, country, post_code, address ), " +
          "order_items ( quantity, unit_price, variant, products ( name ) )",
      )
      .eq("id", order_id)
      .single();

    if (error || !order) {
      console.error("Order lookup failed:", error?.message);
      return json({ error: "Order not found" }, 404);
    }

    const customer = order.customers as Record<string, string | null> | null;
    const items = (order.order_items ?? []) as Array<{
      quantity: number;
      unit_price: number;
      variant: string | null;
      products: { name: string } | null;
    }>;

    const itemsList = items
      .map((i) => {
        const size = i.variant === "large" ? "0,5 кг" : "70 г";
        return `  • ${clean(i.products?.name)} (${size}) × ${i.quantity} — ${i.unit_price} ₴`;
      })
      .join("\n");

    const address = [customer?.post_code, customer?.city, customer?.country, customer?.address]
      .filter(Boolean)
      .map(clean)
      .join(", ");

    const text =
      `🛒 *Нове замовлення!*\n\n` +
      `📦 Замовлення: \`#${order.id.slice(0, 8)}\`\n` +
      `💰 Сума: *${order.total_amount} ₴*\n\n` +
      `👤 *Клієнт:*\n` +
      `Ім'я: ${clean(customer?.full_name)}\n` +
      `Email: ${clean(customer?.email)}\n` +
      (customer?.phone ? `Тел: ${clean(customer.phone)}\n` : "") +
      (address ? `Адреса: ${address}\n` : "") +
      (itemsList ? `\n🧾 *Товари:*\n${itemsList}` : "");

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "Markdown" }),
      },
    );

    const result = await res.json();
    if (!result.ok) console.error("Telegram rejected the message:", result.description);

    return json({ success: Boolean(result.ok) });
  } catch (err) {
    console.error("telegram-notify failed:", err);
    return json({ error: "Failed to send notification" }, 500);
  }
});
