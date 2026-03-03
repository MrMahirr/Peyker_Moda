"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Truck, CheckCircle, ChevronRight,
  MapPin, CreditCard, Search, Box, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { storeApi, Order as ApiOrder } from "@/lib/api";

// --- TİPLER ---

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'pending';

interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  statusCode: OrderStatus;
  stepIndex: number;
  total: number;
  address: string;
  paymentMethod: string;
  cargoTrackingCode?: string;
  cargoProvider?: string;
  cargoLink?: string;
  items: OrderItem[];
}

// --- YARDIMCI FONKSİYONLAR ---

const getStatusCode = (status: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'SHIPPED': 'shipped',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
  };
  return statusMap[status] || 'pending';
};

const getStepIndex = (status: string): number => {
  const stepMap: Record<string, number> = {
    'PENDING': 0,
    'PROCESSING': 1,
    'SHIPPED': 2,
    'DELIVERED': 3,
    'CANCELLED': -1,
  };
  return stepMap[status] ?? 0;
};

const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'PENDING': 'Sipariş Alındı',
    'PROCESSING': 'Hazırlanıyor',
    'SHIPPED': 'Kargoya Verildi',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi',
  };
  return labelMap[status] || status;
};

const transformOrder = (apiOrder: ApiOrder): Order => {
  return {
    id: apiOrder.orderNumber || `SIP-${apiOrder.id.slice(0, 6)}`,
    date: new Date(apiOrder.createdAt).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: getStatusLabel(apiOrder.status),
    statusCode: getStatusCode(apiOrder.status),
    stepIndex: getStepIndex(apiOrder.status),
    total: apiOrder.total,
    address: apiOrder.shippingAddress || 'Adres bilgisi mevcut değil',
    paymentMethod: apiOrder.paymentMethod || 'Belirtilmedi',
    cargoTrackingCode: apiOrder.cargoTrackingCode,
    cargoProvider: apiOrder.cargoProvider,
    items: apiOrder.items?.map((item: any, idx: number) => ({
      id: idx,
      name: item.productName || item.variant?.product?.name || 'Ürün',
      image: item.variant?.product?.images?.[0] || 'https://via.placeholder.com/200',
      price: item.unitPrice || 0,
      quantity: item.quantity || 1,
      size: item.variant?.size || '-',
      color: item.variant?.color || '-',
    })) || []
  };
};

// --- YARDIMCI BİLEŞENLER ---

const StatusStepper = ({ currentStep, status }: { currentStep: number, status: OrderStatus }) => {
  if (status === 'cancelled') return <div className="text-rose-600 font-medium bg-rose-50 p-2 rounded">Sipariş İptal Edildi</div>;

  const steps = ["Sipariş Alındı", "Hazırlanıyor", "Kargoda", "Teslim Edildi"];

  return (
    <div className="relative w-full py-4 hidden sm:block">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 rounded-full" />
      <div
        className="absolute top-1/2 left-0 h-1 bg-stone-900 -translate-y-1/2 rounded-full transition-all duration-500"
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />

      <div className="relative flex justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-4 h-4 rounded-full border-2 transition-colors ${isCompleted ? 'bg-stone-900 border-stone-900' : 'bg-white border-stone-200'}`}>
                {isCompleted && <CheckCircle className="w-full h-full text-white p-[1px]" />}
              </div>
              <span className={`text-xs font-medium ${isCurrent ? 'text-stone-900' : 'text-stone-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300"
    >
      {/* HEADER */}
      <div className="bg-stone-50/80 p-4 border-b border-stone-100 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-stone-400 text-xs block mb-0.5">Sipariş Tarihi</span>
            <span className="font-medium text-stone-700">{order.date}</span>
          </div>
          <div>
            <span className="text-stone-400 text-xs block mb-0.5">Sipariş Özeti</span>
            <span className="font-medium text-stone-700">{order.items.length} Ürün | {formatPrice(order.total)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-400 tracking-wider">#{order.id}</span>
          <Button variant="outline" size="sm" className="h-8 border-stone-200 text-stone-600">Fatura</Button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 sm:hidden">
            <Badge className="bg-stone-900">{order.status}</Badge>
          </div>
          <StatusStepper currentStep={order.stepIndex} status={order.statusCode} />
        </div>

        <div className="space-y-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-start">
              <div className="relative w-20 h-24 bg-stone-100 rounded-md overflow-hidden flex-shrink-0 border border-stone-100">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-stone-900 truncate">{item.name}</h4>
                <p className="text-sm text-stone-500 mt-1">Beden: {item.size} • Renk: {item.color}</p>
                <p className="text-sm font-medium text-amber-600 mt-1">{formatPrice(item.price)}</p>
              </div>
              {order.statusCode === 'delivered' && (
                <Button variant="ghost" size="sm" className="text-stone-400 hover:text-stone-900 hidden sm:flex">
                  Ürünü Değerlendir
                </Button>
              )}
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-8 text-sm text-stone-500">
            <div className="flex items-start gap-2 max-w-[200px]">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{order.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              <span>{order.paymentMethod}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {order.statusCode === 'shipped' && (
              <Button className="flex-1 md:flex-none bg-stone-900 hover:bg-amber-600 text-white gap-2">
                <Truck className="w-4 h-4" /> Kargo Takip
              </Button>
            )}
            {order.statusCode === 'delivered' ? (
              <>
                <Button variant="outline" className="flex-1 md:flex-none border-stone-200">İade Talebi</Button>
                <Button className="flex-1 md:flex-none bg-stone-900 text-white">Tekrar Satın Al</Button>
              </>
            ) : (
              <Button variant="outline" className="flex-1 md:flex-none border-stone-200">Sipariş Detayı</Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- ANA BİLEŞEN ---

export default function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const apiOrders = await storeApi.getOrders();
      setOrders(apiOrders.map(transformOrder));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">Siparişlerim</h2>
          <p className="text-stone-500 text-sm mt-1">Tüm siparişlerinizi detaylı olarak inceleyebilirsiniz.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Sipariş no veya ürün ara..."
            className="pl-9 bg-stone-50 border-stone-200 focus-visible:ring-stone-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-stone-100 p-1 rounded-lg w-full sm:w-auto grid grid-cols-3 sm:flex mb-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Tümü</TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Aktif</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Tamamlanan</TabsTrigger>
        </TabsList>

        <AnimatePresence mode='wait'>
          <TabsContent value="all" className="mt-0">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-0">
            {filteredOrders.filter(o => ['processing', 'shipped', 'pending'].includes(o.statusCode)).map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {filteredOrders.filter(o => ['delivered', 'cancelled'].includes(o.statusCode)).map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

const EmptyState = () => (
  <div className="text-center py-20 bg-stone-50 rounded-xl border border-stone-100 border-dashed">
    <Box className="w-12 h-12 text-stone-300 mx-auto mb-3" />
    <h3 className="text-lg font-medium text-stone-900">Sipariş Bulunamadı</h3>
    <p className="text-stone-500 text-sm">Henüz sipariş kaydınız bulunmuyor.</p>
  </div>
);