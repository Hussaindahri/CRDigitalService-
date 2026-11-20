export type PlatformId =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'telegram'
  | 'facebook'
  | 'linkedin'
  | 'pinterest'
  | 'snapchat';

export type OrderStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed'
  | 'Partial'
  | 'Cancelled';

export type PaymentStatus = 'Approved' | 'Pending' | 'Rejected';

export type UserRole = 'client' | 'admin';

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  path: string;
  headline: string;
  summary: string;
  targetPlaceholder: string;
  deliveryGuidance: string;
  accentHex: string;
}

export interface ServiceItem {
  id: string;
  platform: PlatformId;
  name: string;
  category: string;
  ratePer1k: number;
  minOrder: number;
  maxOrder: number;
  startTime: string;
  speed: string;
  retention: string;
  description: string;
  active: boolean;
}

export interface OrderRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  serviceId: string;
  serviceName: string;
  platform: PlatformId;
  targetUrl: string;
  quantity: number;
  delivered: number;
  charge: number;
  status: OrderStatus;
  createdAt: string;
  refillRequested?: boolean;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  method: string;
  reference: string;
  amount: number;
  currency?: 'USD' | 'PKR';
  originalAmount?: number;
  type: 'Deposit' | 'Order Debit' | 'Refund';
  status: PaymentStatus;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  balance: number;
  totalSpent: number;
  status: 'Active' | 'Suspended';
  createdAt: string;
}

export interface LeadInquiry {
  id: string;
  name: string;
  email: string;
  platform: string;
  monthlyBudget: string;
  notes: string;
  createdAt: string;
}
