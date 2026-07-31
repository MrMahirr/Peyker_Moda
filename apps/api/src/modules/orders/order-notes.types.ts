export interface OrderNoteRecord {
  id: string;
  orderId: string;
  content: string;
  isInternal: boolean;
  userId: string;
  createdAt: string;
}

export interface OrderNoteResponse extends OrderNoteRecord {
  userName?: string;
}
