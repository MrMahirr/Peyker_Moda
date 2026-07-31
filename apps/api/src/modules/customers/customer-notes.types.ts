export enum CustomerNoteType {
  CALL = 'CALL',
  VISIT = 'VISIT',
  EMAIL = 'EMAIL',
  OTHER = 'OTHER',
}

export interface CustomerNoteRecord {
  id: string;
  customerId: string;
  content: string;
  type: CustomerNoteType;
  userId: string;
  createdAt: string;
}

export interface CustomerNoteResponse extends CustomerNoteRecord {
  userName?: string;
}
