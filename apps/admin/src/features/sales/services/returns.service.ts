import api from "../../../lib/axios";

export type ReturnStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
export type ReturnSource = "POS" | "ONLINE" | "PHONE";

export interface ReturnQueryParams {
  page?: number;
  limit?: number;
  status?: ReturnStatus;
  source?: ReturnSource;
  search?: string;
  orderNumber?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  source: ReturnSource;
  customer: string;
  customerPhone?: string;
  date: string;
  amount: number;
  itemCount: number;
  status: ReturnStatus;
  reason: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnListResponse {
  data: ReturnRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiReturnItem {
  id: string;
  variantId: string;
  quantity: number;
  reason?: string | null;
}

interface ApiReturn {
  id: string;
  orderId: string;
  reason: string;
  refundAmount: number | string;
  status: ReturnStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: ApiReturnItem[];
  order?: {
    id: string;
    orderNumber: string;
    source: ReturnSource;
    customer?: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  } | null;
}

const STATUS_LABELS: Record<ReturnStatus, string> = {
  PENDING: "Bekliyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
  COMPLETED: "Tamamlandı",
};

const SOURCE_LABELS: Record<ReturnSource, string> = {
  POS: "POS",
  ONLINE: "Online",
  PHONE: "Telefon",
};

const DEFAULT_META = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const formatCustomerName = (ret: ApiReturn) => {
  const customer = ret.order?.customer;
  const name = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "Bilinmeyen Müşteri";
};

const mapReturn = (ret: ApiReturn): ReturnRequest => ({
  id: ret.id,
  orderId: ret.order?.id || ret.orderId,
  orderNumber: ret.order?.orderNumber || ret.orderId,
  source: ret.order?.source || "POS",
  customer: formatCustomerName(ret),
  customerPhone: ret.order?.customer?.phone || undefined,
  date: ret.createdAt,
  amount: Number(ret.refundAmount || 0),
  itemCount: (ret.items || []).reduce((sum, item) => sum + item.quantity, 0),
  status: ret.status,
  reason: ret.reason,
  notes: ret.notes,
  createdAt: ret.createdAt,
  updatedAt: ret.updatedAt,
});

export const returnsService = {
  async getAll(params?: ReturnQueryParams): Promise<ReturnListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.status) queryParams.append("status", params.status);
    if (params?.source) queryParams.append("source", params.source);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.orderNumber)
      queryParams.append("orderNumber", params.orderNumber);
    if (params?.customerId) queryParams.append("customerId", params.customerId);
    if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params?.dateTo) queryParams.append("dateTo", params.dateTo);

    const response = await api.get(`/returns?${queryParams}`);
    const records = (response.data?.data || []) as ApiReturn[];
    return {
      data: records.map(mapReturn),
      meta: response.data?.meta || {
        ...DEFAULT_META,
        total: records.length,
        limit: params?.limit || DEFAULT_META.limit,
      },
    };
  },

  async approve(returnId: string): Promise<void> {
    await api.patch(`/returns/${returnId}/approve`, {
      restock: true,
      notes: "Admin liste ekranından onaylandı",
    });
  },

  async reject(returnId: string, reason: string): Promise<void> {
    await api.patch(`/returns/${returnId}/reject`, { reason });
  },

  getStatusLabel(status: ReturnStatus): string {
    return STATUS_LABELS[status] || status;
  },

  getSourceLabel(source: ReturnSource): string {
    return SOURCE_LABELS[source] || source;
  },
};
