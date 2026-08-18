import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LogOut, Package, ChevronDown, ChevronUp, RefreshCw, Bell, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

// Shapes of the two joined selects below. PostgREST embeds the related row
// under the table name, which the generated types do not express.
type OrderRow = Tables<"orders"> & { customers: Tables<"customers"> | null };
type OrderItemRow = Tables<"order_items"> & { products: { name: string } | null };

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name?: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    post_code: string | null;
  };
  items: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "new", label: "Новый", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "processing", label: "В обработке", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "shipped", label: "Отправлен", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "delivered", label: "Доставлен", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "cancelled", label: "Отменён", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const AdminOrdersPage = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const { count } = await supabase
      .from("admin_notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);
    setUnreadCount(count || 0);
  }, []);

  const markAllRead = async () => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("is_read", false);
    setUnreadCount(0);
    toast({ title: "Все уведомления прочитаны" });
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*, customers(*)")
      .order("created_at", { ascending: false });

    if (ordersError) {
      toast({ title: "Ошибка загрузки заказов", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: itemsData } = await supabase
      .from("order_items")
      .select("*, products(name)");

    const { data: productsData } = await supabase.from("products").select("id, name");
    const productMap = new Map(productsData?.map((p) => [p.id, p.name]) || []);

    const enrichedOrders: Order[] = ((ordersData ?? []) as OrderRow[]).map((o) => ({
      id: o.id,
      status: o.status,
      total_amount: o.total_amount,
      notes: o.notes,
      created_at: o.created_at,
      updated_at: o.updated_at,
      customer: o.customers || { full_name: "—", email: "—", phone: null, address: null, city: null, country: null, post_code: null },
      items: ((itemsData ?? []) as OrderItemRow[])
        .filter((item) => item.order_id === o.id)
        .map((item) => ({
          ...item,
          product_name: item.products?.name || productMap.get(item.product_id) || "Неизвестный товар",
        })),
    }));

    setOrders(enrichedOrders);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      fetchNotifications();
    }
  }, [isAdmin, fetchOrders, fetchNotifications]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Ошибка обновления статуса", variant: "destructive" });
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    toast({ title: "Статус обновлён" });
  };

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find((o) => o.value === status);
    return (
      <Badge variant="outline" className={s?.color || ""}>
        {s?.label || status}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Управление заказами
          </h1>
          <Badge variant="secondary" className="ml-2">{filteredOrders.length}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/analytics")}>
            <TrendingUp className="w-4 h-4 mr-1" /> Аналитика
          </Button>
          <Button variant="outline" size="sm" className="relative" onClick={markAllRead}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4 mr-1" /> Обновить
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Выйти
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Фильтр:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все заказы</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card className="gold-border-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Заказ</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Заказов не найдено
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <>
                      <TableRow
                        key={order.id}
                        className="cursor-pointer"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <TableCell>
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer.full_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(order.created_at).toLocaleDateString("ru-RU", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {order.total_amount.toLocaleString("ru-RU")} ₸
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={order.status}
                            onValueChange={(v) => updateStatus(order.id, v)}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>

                      {expandedOrder === order.id && (
                        <TableRow key={`${order.id}-detail`}>
                          <TableCell colSpan={7} className="bg-muted/30 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Order Items */}
                              <div>
                                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                                  Товары
                                </h4>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex justify-between items-center p-2 rounded bg-background/50"
                                    >
                                      <span className="text-sm">{item.product_name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {item.quantity} × {item.unit_price.toLocaleString("ru-RU")} ₸
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {order.notes && (
                                  <div className="mt-4 p-3 rounded bg-background/50 border border-border">
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Примечание</p>
                                    <p className="text-sm">{order.notes}</p>
                                  </div>
                                )}
                              </div>

                              {/* Customer Info */}
                              <div>
                                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                                  Клиент
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <Row label="Имя" value={order.customer.full_name} />
                                  <Row label="Email" value={order.customer.email} />
                                  <Row label="Телефон" value={order.customer.phone} />
                                  <Row label="Адрес" value={order.customer.address} />
                                  <Row label="Город" value={order.customer.city} />
                                  <Row label="Страна" value={order.customer.country} />
                                  <Row label="Индекс" value={order.customer.post_code} />
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span>{value || "—"}</span>
  </div>
);

export default AdminOrdersPage;
