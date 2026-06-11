"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyOrdersState } from "./orders/EmptyOrdersState";
import { OrderCard } from "./orders/OrderCard";
import { useOrders } from "./orders/hooks/useOrders";
import { Order } from "./orders/types";

const ACTIVE_ORDER_STATUSES = ["processing", "shipped", "pending"];
const COMPLETED_ORDER_STATUSES = ["delivered", "cancelled"];

const filterOrdersBySearch = (orders: Order[], searchTerm: string) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) return orders;

  return orders.filter(
    (order) =>
      order.id.toLowerCase().includes(normalizedSearch) ||
      order.orderNumber.toLowerCase().includes(normalizedSearch) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(normalizedSearch),
      ),
  );
};

export default function OrdersContent() {
  const { orders, loading, error } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = useMemo(
    () => filterOrdersBySearch(orders, searchTerm),
    [orders, searchTerm],
  );

  const activeOrders = useMemo(
    () =>
      filteredOrders.filter((order) =>
        ACTIVE_ORDER_STATUSES.includes(order.statusCode),
      ),
    [filteredOrders],
  );

  const completedOrders = useMemo(
    () =>
      filteredOrders.filter((order) =>
        COMPLETED_ORDER_STATUSES.includes(order.statusCode),
      ),
    [filteredOrders],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-medium text-rose-700">
        Siparisler yuklenirken bir hata olustu.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Siparislerim
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Tum siparislerinizi detayli olarak inceleyebilirsiniz.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Siparis no veya urun ara..."
            className="pl-9 bg-stone-50 border-stone-200 focus-visible:ring-stone-900"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-stone-100 p-1 rounded-lg w-full sm:w-auto grid grid-cols-3 sm:flex mb-6">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Tumu
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Aktif
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Tamamlanan
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <OrderTabContent value="all" orders={filteredOrders} />
          <OrderTabContent value="active" orders={activeOrders} />
          <OrderTabContent value="completed" orders={completedOrders} />
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

function OrderTabContent({
  value,
  orders,
}: {
  value: string;
  orders: Order[];
}) {
  return (
    <TabsContent value={value} className="mt-0">
      {orders.length > 0 ? (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      ) : (
        <EmptyOrdersState />
      )}
    </TabsContent>
  );
}
