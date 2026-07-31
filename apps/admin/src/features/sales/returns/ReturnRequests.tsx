import { useCallback, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  BadgeCheck,
  FileText,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";
import { DataGrid } from "@/components/shared/DataGrid";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { swal } from "@/utils/swal";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  ReturnRequest,
  ReturnSource,
  ReturnStatus,
  returnsService,
} from "../services/returns.service";

const statusOptions: Array<{ value: ReturnStatus | ""; label: string }> = [
  { value: "", label: "Tüm durumlar" },
  { value: "PENDING", label: "Bekliyor" },
  { value: "APPROVED", label: "Onaylandı" },
  { value: "COMPLETED", label: "Tamamlandı" },
  { value: "REJECTED", label: "Reddedildi" },
];

const sourceOptions: Array<{ value: ReturnSource | ""; label: string }> = [
  { value: "", label: "Tüm kaynaklar" },
  { value: "POS", label: "POS" },
  { value: "ONLINE", label: "Online" },
  { value: "PHONE", label: "Telefon" },
];

const getStatusVariant = (
  status: ReturnStatus,
): "neutral" | "info" | "success" | "warning" | "error" => {
  if (status === "PENDING") return "warning";
  if (status === "APPROVED") return "info";
  if (status === "COMPLETED") return "success";
  if (status === "REJECTED") return "error";
  return "neutral";
};

const getSourceVariant = (
  source: ReturnSource,
): "neutral" | "info" | "success" | "warning" | "error" => {
  if (source === "POS") return "neutral";
  if (source === "ONLINE") return "info";
  if (source === "PHONE") return "warning";
  return "neutral";
};

const formatCurrency = (value: number) =>
  value.toLocaleString("tr-TR", { minimumFractionDigits: 2 });

const formatDate = (value: string) =>
  new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const ReturnRequests = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | "">("");
  const [sourceFilter, setSourceFilter] = useState<ReturnSource | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchReturns = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await returnsService.getAll({
        limit: 100,
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setReturns(response.data);
      setTotalCount(response.meta.total);
    } catch (err) {
      console.error("Returns fetch error:", err);
      toast.error("İade talepleri yüklenemedi.", { className: "font-medium" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appliedSearch, dateFrom, dateTo, sourceFilter, statusFilter]);

  useEffect(() => {
    void fetchReturns();
  }, [fetchReturns]);

  const handleApplySearch = () => {
    setAppliedSearch(searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setStatusFilter("");
    setSourceFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const handleApprove = async (ret: ReturnRequest) => {
    const result = await swal.fire({
      title: "İade onaylansın mı?",
      text: `${ret.orderNumber} siparişi için ${formatCurrency(ret.amount)} TL iade talebi onaylanacak.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Onayla",
      cancelButtonText: "Vazgeç",
    });

    if (!result.isConfirmed) return;

    try {
      await returnsService.approve(ret.id);
      toast.success("İade talebi onaylandı.", { className: "font-medium" });
      await fetchReturns();
    } catch (err) {
      console.error("Return approve error:", err);
      toast.error("İade onaylanamadı.", { className: "font-medium" });
    }
  };

  const handleReject = async (ret: ReturnRequest) => {
    const result = await swal.fire({
      title: "İadeyi reddet",
      input: "textarea",
      inputLabel: "Red sebebi",
      inputPlaceholder: "Müşteriye ve ekibe görünecek kısa sebep...",
      inputValidator: (value) => {
        if (!value?.trim()) return "Red sebebi zorunludur.";
        return null;
      },
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reddet",
      cancelButtonText: "Vazgeç",
      customClass: {
        confirmButton:
          "bg-red-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all mx-2",
        cancelButton:
          "bg-zinc-100 text-zinc-600 font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 focus:ring-4 focus:ring-zinc-100 transition-all mx-2",
      },
    });

    if (!result.isConfirmed || typeof result.value !== "string") return;

    try {
      await returnsService.reject(ret.id, result.value.trim());
      toast.info("İade talebi reddedildi.", { className: "font-medium" });
      await fetchReturns();
    } catch (err) {
      console.error("Return reject error:", err);
      toast.error("İade reddedilemedi.", { className: "font-medium" });
    }
  };

  const columns: ColumnDef<ReturnRequest>[] = [
    {
      header: "İade No",
      accessorKey: "id",
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-bold text-zinc-900">
          {row.original.id.slice(0, 8)}
        </span>
      ),
    },
    {
      header: "Sipariş No",
      accessorKey: "orderNumber",
      cell: ({ row }) => (
        <span className="font-mono text-[13px] text-zinc-600 font-semibold">
          {row.original.orderNumber}
        </span>
      ),
    },
    {
      header: "Kaynak",
      accessorKey: "source",
      cell: ({ row }) => (
        <Badge variant={getSourceVariant(row.original.source)}>
          {returnsService.getSourceLabel(row.original.source)}
        </Badge>
      ),
    },
    {
      header: "Müşteri",
      accessorKey: "customer",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-zinc-900 text-[14px]">
            {row.original.customer}
          </div>
          {row.original.customerPhone && (
            <div className="text-xs font-medium text-zinc-500">
              {row.original.customerPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Talep Tarihi",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-[13px] font-medium text-zinc-600">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      header: "Tutar",
      accessorKey: "amount",
      cell: ({ row }) => (
        <span className="font-bold text-[14px] font-mono text-zinc-900">
          {formatCurrency(row.original.amount)} TL
        </span>
      ),
    },
    {
      header: "Kalem",
      accessorKey: "itemCount",
      cell: ({ row }) => (
        <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">
          {row.original.itemCount}
        </span>
      ),
    },
    {
      header: "Durum",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)} dot>
          {returnsService.getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      header: "İşlemler",
      id: "actions",
      cell: ({ row }) => {
        const ret = row.original;
        const canApprove = ret.status === "PENDING";
        const canReject = ret.status === "PENDING" || ret.status === "APPROVED";

        return (
          <div className="flex justify-end items-center gap-1">
            {canApprove && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={() => handleApprove(ret)}
                title="Onayla"
              >
                <BadgeCheck className="h-4 w-4" />
              </Button>
            )}
            {canReject && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleReject(ret)}
                title="Reddet"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50"
              title="Detay"
              onClick={() =>
                toast.info("Detay ekranı sonraki fazda bağlanacak.")
              }
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
        <p className="text-[13px] font-medium text-zinc-500">
          İade talepleri yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <PageHeader
            title="İade Talepleri"
            subtitle="Gerçek iade kayıtları."
          />
          <p className="text-[13px] font-medium text-zinc-500 mt-1">
            POS ve online kanaldan gelen iade taleplerini filtreleyin ve
            yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-600">
            Toplam {totalCount}
          </span>
          <Button
            variant="secondary"
            className="shadow-sm border border-zinc-200/80 bg-white hover:bg-zinc-50"
            onClick={fetchReturns}
            loading={refreshing}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      <div className="space-y-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="İade no, sipariş no, müşteri adı veya telefon ara..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplySearch()}
              className="w-full h-10 pl-10 pr-4 bg-white border border-zinc-200/80 rounded-lg text-[13px] font-medium"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ReturnStatus | "")
            }
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-semibold text-zinc-700"
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) =>
              setSourceFilter(e.target.value as ReturnSource | "")
            }
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-semibold text-zinc-700"
          >
            {sourceOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="primary" onClick={handleApplySearch}>
            <Search className="mr-2 h-4 w-4" />
            Ara
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            Başlangıç
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 bg-white"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            Bitiş
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 bg-white"
            />
          </label>
          <Button
            variant="secondary"
            className="h-9 bg-white border border-zinc-200/80"
            onClick={handleResetFilters}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtreleri Temizle
          </Button>
        </div>
      </div>

      <DataGrid data={returns} columns={columns} />
    </div>
  );
};
