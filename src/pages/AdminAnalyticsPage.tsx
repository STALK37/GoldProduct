import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { LogOut, Package, TrendingUp, ShoppingCart, Users, DollarSign, ArrowLeft, RefreshCw } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

// PostgREST embeds the joined product under its table name.
type OrderItemRow = Tables<"order_items"> & { products: { name: string } | null };

const COLORS = ["hsl(43,72%,55%)", "hsl(43,80%,70%)", "hsl(43,60%,35%)", "hsl(30,8%,40%)", "hsl(0,84%,60%)"];

const AdminAnalyticsPage = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, avgOrder: 0 });
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/admin");
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchAnalytics();
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    setLoading(true);

    const [ordersRes, customersRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("customers").select("id"),
      supabase.from("order_items").select("*, products(name)"),
    ]);

    const orders = ordersRes.data || [];
    const customers = customersRes.data || [];
    const items = itemsRes.data || [];

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
    setStats({
      totalOrders: orders.length,
      totalRevenue,
      totalCustomers: customers.length,
      avgOrder: orders.length ? Math.round(totalRevenue / orders.length) : 0,
    });

    // Status distribution
    const statusMap: Record<string, number> = {};
    const statusLabels: Record<string, string> = {
      new: "Новый", processing: "В обработке", shipped: "Отправлен", delivered: "Доставлен", cancelled: "Отменён",
    };
    orders.forEach((o) => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
    setStatusData(Object.entries(statusMap).map(([k, v]) => ({ name: statusLabels[k] || k, value: v })));

    // Revenue by day (last 14 days)
    const dayMap: Record<string, { revenue: number; orders: number }> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { revenue: 0, orders: 0 };
    }
    orders.forEach((o) => {
      const key = o.created_at.slice(0, 10);
      if (dayMap[key]) { dayMap[key].revenue += Number(o.total_amount); dayMap[key].orders += 1; }
    });
    setRevenueByDay(
      Object.entries(dayMap).map(([date, d]) => ({
        date: new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
        revenue: d.revenue,
        orders: d.orders,
      }))
    );

    // Top products
    const prodMap: Record<string, number> = {};
    (items as OrderItemRow[]).forEach((item) => {
      const name = item.products?.name || "Неизвестный";
      prodMap[name] = (prodMap[name] || 0) + item.quantity;
    });
    setTopProducts(
      Object.entries(prodMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }))
    );

    setLoading(false);
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
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Аналитика
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Заказы
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Выйти
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Всего заказов" value={stats.totalOrders.toString()} />
          <StatCard icon={<DollarSign className="w-5 h-5" />} label="Общий доход" value={`${stats.totalRevenue.toLocaleString("ru-RU")} ₸`} />
          <StatCard icon={<Users className="w-5 h-5" />} label="Клиентов" value={stats.totalCustomers.toString()} />
          <StatCard icon={<Package className="w-5 h-5" />} label="Средний чек" value={`${stats.avgOrder.toLocaleString("ru-RU")} ₸`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <Card className="gold-border-card lg:col-span-2">
            <CardHeader><CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Доход за 14 дней</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,8%,22%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(30,12%,65%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(30,12%,65%)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(30,8%,15%)", border: "1px solid hsl(43,30%,25%)", borderRadius: 8, color: "hsl(43,30%,85%)" }}
                    formatter={(value: number) => [`${value.toLocaleString("ru-RU")} ₸`, "Доход"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(43,72%,55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status pie */}
          <Card className="gold-border-card">
            <CardHeader><CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Статусы заказов</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(30,8%,15%)", border: "1px solid hsl(43,30%,25%)", borderRadius: 8, color: "hsl(43,30%,85%)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {statusData.map((s, i) => (
                  <Badge key={s.name} variant="outline" className="text-xs" style={{ borderColor: COLORS[i % COLORS.length], color: COLORS[i % COLORS.length] }}>
                    {s.name}: {s.value}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top products */}
        <Card className="gold-border-card">
          <CardHeader><CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Топ продуктов</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,8%,22%)" />
                <XAxis type="number" tick={{ fill: "hsl(30,12%,65%)", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: "hsl(30,12%,65%)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(30,8%,15%)", border: "1px solid hsl(43,30%,25%)", borderRadius: 8, color: "hsl(43,30%,85%)" }} />
                <Bar dataKey="quantity" fill="hsl(43,80%,70%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card className="gold-border-card">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default AdminAnalyticsPage;
