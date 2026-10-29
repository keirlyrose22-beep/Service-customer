export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'pending' | 'investigating' | 'resolved' | 'closed';
export type Channel = 'email' | 'chat' | 'phone' | 'storefront';

export interface TicketMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isInternalNote?: boolean;
}

export interface Ticket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  subject: string;
  priority: Priority;
  status: TicketStatus;
  channel: Channel;
  assignedAgent: string;
  createdAt: string;
  slaDueMinutes: number; // minutes remaining before SLA breach
  tags: string[];
  messages: TicketMessage[];
}

export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'on_hold';
export type PaymentStatus = 'paid' | 'refunded' | 'partially_refunded' | 'pending';

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  image: string;
  variant?: string;
}

export interface OrderTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'placed' | 'paid' | 'fulfillment' | 'shipped' | 'delivered' | 'refund' | 'note';
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  timeline: OrderTimelineEvent[];
  notes?: string;
  rma?: {
    id: string;
    reason: string;
    status: 'requested' | 'approved' | 'received' | 'refunded';
    refundAmount: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  tier: 'VIP' | 'Regular' | 'New';
  notes: string;
  joinDate: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockMain: number;
  stockWest: number;
  stockEU: number;
  totalStock: number;
  reserved: number;
  price: number;
  image: string;
  reorderPoint: number;
}
