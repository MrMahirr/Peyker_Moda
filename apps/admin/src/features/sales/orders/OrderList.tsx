import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2, MonitorSmartphone, Store, Wallet } from "lucide-react";
import { toast } from "sonner";
import { DataGrid } from "@/components/shared/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Order, ordersService } from "../services/orders.service";

type OrderSourceView = "ONLINE" | "POS";

const SOURCE_CONFIG: Record<
  OrderSourceView,
  {
    title: string;
    description: string;
    emptyMessage: string;
    icon: typeof MonitorSmartphone;
  }
> = {
  ONLINE: {
    title: "Web Satislari",
    description: "Web sayfasindan gelen siparisler",
    emptyMessage: "Web satisi bulunamadi.",
    icon: MonitorSmartphone,
  },
  POS: {
    title: "Magaza POS Islemleri",
    description: "Magaza kasasindan yapilan satislar",
    emptyMessage: "POS islemi bulunamadi.",
    icon: Store,
  },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "neutral" | "info" | "success" | "warning" | "error";
  }
> = {
  PENDING: { label: "Beklemede", variant: "warning" },
  CONFIRMED: { label: "Onaylandi", variant: "info" },
  PROCESSING: { label: "Hazirlaniyor", variant: "info" },
  SHIPPED: { label: "Kargoda", variant: "neutral" },
  DELIVERED: { label: "Teslim Edildi", variant: "success" },
  COMPLETED: { label: "Tamamlandi", variant: "success" },
  CANCELLED: { label: "Iptal Edildi", variant: "error" },
  RETURNED: { label: "Iade Edildi", variant: "error" },
};

const PAYMENT_MAP: Record<
  string,
  {
    label: string;
    variant: "neutral" | "info" | "success" | "warning" | "error";
  }
> = {
  PENDING: { label: "Bekliyor", variant: "warning" },
  PARTIAL: { label: "Kismi Odeme", variant: "info" },
  COMPLETED: { label: "Odendi", variant: "success" },
  FAILED: { label: "Basarisiz", variant: "error" },
  REFUNDED: { label: "Iade", variant: "neutral" },
};

const getOrderTotal = (order: Order) => Number(order.totalAmount || 0);
const getPaidTotal = (order: Order) => Number(order.paidAmount || 0);

export const OrderList = () => {
  const navigate = useNavigate();
  const [activeSource, setActiveSource] = useState<OrderSourceView>("ONLINE");
  const [webOrders, setWebOrders] = useState<Order[]>([]);
  const [posOrders, setPosOrders] = useState<Order[]>([]);
  const [totalCounts, setTotalCounts] = useState<
    Record<OrderSourceView, number>
  >({
    ONLINE: 0,
    POS: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [onlineResponse, posResponse] = await Promise.all([
          ordersService.getAll({ limit: 50, source: "ONLINE" }),
          ordersService.getAll({ limit: 50, source: "POS" }),
        ]);

        setWebOrders(onlineResponse.data || []);
        setPosOrders(posResponse.data || []);
        setTotalCounts({
          ONLINE:
            onlineResponse.meta?.total ?? onlineResponse.data?.length ?? 0,
          POS: posResponse.meta?.total ?? posResponse.data?.length ?? 0,
        });
      } catch (err) {
        setError("Siparisler yuklenemedi");
        console.error("Orders fetch error:", err);
        toast.error("Siparisler yuklenirken bir hata olustu");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Siparis No",
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-bold text-zinc-900 bg-zinc-100/80 px-2 py-1 rounded-md border border-zinc-200/50">
          {row.getValue("orderNumber")}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Musteri",
      cell: ({ row }) => {
        const customer = row.original.customer;
        return customer ? (
          <div className="flex flex-col py-1">
            <div className="font-semibold text-[14px] text-zinc-900">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="text-[11px] font-medium text-zinc-500">
              {customer.phone}
            </div>
          </div>
        ) : (
          <span className="text-zinc-400 font-medium">
            {row.original.source === "POS" ? "Magaza musterisi" : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Tutar",
      cell: ({ row }) => (
        <span className="font-bold text-[15px] font-mono text-zinc-900">
          {formatCurrency(getOrderTotal(row.original))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Siparis Durumu",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusInfo = STATUS_MAP[status] || {
          label: status,
          variant: "neutral" as const,
        };
        return (
          <Badge variant={statusInfo.variant} dot>
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Odeme",
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        const statusInfo = PAYMENT_MAP[status] || {
          label: status,
          variant: "neutral" as const,
        };
        const label =
          status === "COMPLETED" && row.original.source === "POS"
            ? "Tahsil Edildi"
            : statusInfo.label;

        return <Badge variant={statusInfo.variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tarih",
      cell: ({ row }) => (
        <span className="text-[13px] font-medium text-zinc-500">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow-md rounded-full"
            onClick={() => navigate(`/sales/orders/${row.original.id}`)}
            aria-label="Siparis detayini ac"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const sourceOrders = useMemo(
    () => ({
      ONLINE: webOrders,
      POS: posOrders,
    }),
    [posOrders, webOrders],
  );

  const activeOrders = sourceOrders[activeSource];
  const activeConfig = SOURCE_CONFIG[activeSource];
  const ActiveIcon = activeConfig.icon;

  const sourceStats = useMemo(
    () =>
      (Object.keys(SOURCE_CONFIG) as OrderSourceView[]).reduce(
        (stats, source) => {
          const orders = sourceOrders[source];
          stats[source] = {
            count: totalCounts[source],
            listedCount: orders.length,
            total: orders.reduce((sum, order) => sum + getOrderTotal(order), 0),
            paid: orders.reduce((sum, order) => sum + getPaidTotal(order), 0),
          };
          return stats;
        },
        {} as Record<
          OrderSourceView,
          { count: number; listedCount: number; total: number; paid: number }
        >,
      ),
    [sourceOrders, totalCounts],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
        <p className="text-[13px] font-medium text-zinc-500">
          Siparisler yukleniyor...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">
          Siparis Yonetimi
        </h2>
        <p className="text-[13px] font-medium text-zinc-500">
          Web satislari ve magaza POS islemleri ayri listelerde takip edilir.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(SOURCE_CONFIG) as OrderSourceView[]).map((source) => {
          const config = SOURCE_CONFIG[source];
          const Icon = config.icon;
          const stats = sourceStats[source];
          const isActive = activeSource === source;

          return (
            <button
              key={source}
              type="button"
              onClick={() => setActiveSource(source)}
              className={cn(
                "rounded-xl border bg-white p-5 text-left shadow-sm transition-all",
                isActive
                  ? "border-zinc-900 ring-2 ring-zinc-900/10"
                  : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-md",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-lg border",
                      isActive
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900">
                      {config.title}
                    </div>
                    <div className="text-xs font-medium text-zinc-500">
                      {config.description}
                    </div>
                  </div>
                </div>
                <Badge variant={isActive ? "neutral" : "info"}>
                  {stats.count} kayit
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    Satis Tutari
                  </div>
                  <div className="mt-1 font-mono text-lg font-black text-zinc-900">
                    {formatCurrency(stats.total)}
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    <Wallet className="h-3.5 w-3.5" />
                    Tahsilat
                  </div>
                  <div className="mt-1 font-mono text-lg font-black text-zinc-900">
                    {formatCurrency(stats.paid)}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ActiveIcon className="h-5 w-5 text-zinc-700" />
              <h3 className="text-lg font-black text-zinc-900">
                {activeConfig.title}
              </h3>
            </div>
            <p className="mt-1 text-[13px] font-medium text-zinc-500">
              {activeConfig.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">
              {sourceStats[activeSource].count} toplam kayit
            </Badge>
            <Badge variant="success">
              {formatCurrency(sourceStats[activeSource].total)}
            </Badge>
          </div>
        </div>

        {activeOrders.length > 0 ? (
          <DataGrid
            columns={columns}
            data={activeOrders}
            searchKey="orderNumber"
          />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
            <p className="text-sm font-semibold text-zinc-700">
              {activeConfig.emptyMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
