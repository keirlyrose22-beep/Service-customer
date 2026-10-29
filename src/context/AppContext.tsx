import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Order, Ticket, InventoryItem, FulfillmentStatus, Priority, TicketStatus } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_TICKETS, INITIAL_INVENTORY } from '../data/mockData';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  // Navigation & Views
  viewMode: 'agent' | 'customer_portal';
  setViewMode: (mode: 'agent' | 'customer_portal') => void;
  activeTab: 'inbox' | 'orders' | 'pipeline' | 'customers' | 'inventory' | 'analytics';
  setActiveTab: (tab: 'inbox' | 'orders' | 'pipeline' | 'customers' | 'inventory' | 'analytics') => void;
  
  // Selection
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;

  // Data
  tickets: Ticket[];
  orders: Order[];
  customers: Customer[];
  inventory: InventoryItem[];

  // Ticket Operations
  addTicketMessage: (ticketId: string, text: string, isInternalNote: boolean) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateTicketPriority: (ticketId: string, priority: Priority) => void;
  updateTicketAgent: (ticketId: string, agent: string) => void;
  createNewTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'messages'>, initialMessage: string) => string;

  // Order Operations
  updateOrderStatus: (orderId: string, status: FulfillmentStatus, carrier?: string, tracking?: string) => void;
  updateOrderAddress: (orderId: string, address: Order['shippingAddress']) => void;
  issueOrderRefund: (orderId: string, amount: number, reason: string) => void;
  createOrderRMA: (orderId: string, reason: string) => void;
  createNewOrder: (orderData: Partial<Order>) => string;

  // Inventory Operations
  adjustInventoryStock: (itemId: string, warehouse: 'stockMain' | 'stockWest' | 'stockEU', delta: number) => void;

  // Search & Utilities
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TICKETS: 'omnidesk_tickets_v1',
  ORDERS: 'omnidesk_orders_v1',
  CUSTOMERS: 'omnidesk_customers_v1',
  INVENTORY: 'omnidesk_inventory_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'agent' | 'customer_portal'>('agent');
  const [activeTab, setActiveTab] = useState<'inbox' | 'orders' | 'pipeline' | 'customers' | 'inventory' | 'analytics'>('inbox');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('TICK-1042');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Initialize data with local storage fallback
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return stored ? JSON.parse(stored) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return stored ? JSON.parse(stored) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch {
      // ignore
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch {
      // ignore
    }
  }, [inventory]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addTicketMessage = (ticketId: string, text: string, isInternalNote: boolean) => {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;
        const newMessage = {
          id: `MSG-${Date.now().toString().slice(-4)}`,
          sender: isInternalNote ? ('agent' as const) : ('agent' as const),
          senderName: isInternalNote ? 'Alex Rivera (Internal Staff)' : 'Alex Rivera (Support Specialist)',
          text,
          timestamp: timeString,
          isInternalNote,
        };

        // If it's a customer-facing reply, update status if needed
        const updatedStatus = !isInternalNote && ticket.status === 'open' ? 'pending' : ticket.status;

        return {
          ...ticket,
          status: updatedStatus,
          messages: [...ticket.messages, newMessage],
        };
      })
    );

    showToast(isInternalNote ? 'Internal note appended to ticket' : 'Response dispatched to customer', 'success');
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
    showToast(`Ticket status updated to ${status.toUpperCase()}`, 'info');
  };

  const updateTicketPriority = (ticketId: string, priority: Priority) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, priority } : t))
    );
    showToast(`Priority adjusted to ${priority.toUpperCase()}`, 'info');
  };

  const updateTicketAgent = (ticketId: string, agent: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, assignedAgent: agent } : t))
    );
    showToast(`Ticket reassigned to ${agent}`, 'info');
  };

  const createNewTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'messages'>, initialMessage: string): string => {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newId = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: Ticket = {
      ...ticketData,
      id: newId,
      createdAt: timeString,
      messages: [
        {
          id: `MSG-${Date.now().toString().slice(-4)}`,
          sender: 'customer',
          senderName: ticketData.customerName,
          text: initialMessage,
          timestamp: timeString,
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newId);
    showToast(`Ticket ${newId} created successfully`, 'success');
    return newId;
  };

  const updateOrderStatus = (orderId: string, status: FulfillmentStatus, carrier?: string, tracking?: string) => {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const timelineEvent = {
          id: `EV-${Date.now().toString().slice(-4)}`,
          title: `Fulfillment status changed to ${status.replace('_', ' ').toUpperCase()}`,
          description: carrier && tracking 
            ? `Dispatched via ${carrier} (Tracking: ${tracking})` 
            : `Status changed by logistics coordinator`,
          timestamp: timeString,
          type: (status === 'shipped' ? 'shipped' : status === 'delivered' ? 'delivered' : 'fulfillment') as any,
        };

        return {
          ...order,
          fulfillmentStatus: status,
          carrier: carrier || order.carrier,
          trackingNumber: tracking || order.trackingNumber,
          timeline: [...order.timeline, timelineEvent],
        };
      })
    );

    showToast(`Order ${orderId} updated to ${status.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const updateOrderAddress = (orderId: string, address: Order['shippingAddress']) => {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const timelineEvent = {
          id: `EV-${Date.now().toString().slice(-4)}`,
          title: 'Shipping Address Amended',
          description: `Updated destination to: ${address.street}, ${address.city}, ${address.state} ${address.zip}`,
          timestamp: timeString,
          type: 'note' as const,
        };

        return {
          ...order,
          shippingAddress: address,
          timeline: [...order.timeline, timelineEvent],
        };
      })
    );

    showToast(`Destination address updated for order ${orderId}`, 'success');
  };

  const issueOrderRefund = (orderId: string, amount: number, reason: string) => {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const isFull = amount >= order.totalAmount;
        const newPaymentStatus = isFull ? 'refunded' : 'partially_refunded';

        const timelineEvent = {
          id: `EV-${Date.now().toString().slice(-4)}`,
          title: isFull ? 'Full Refund Processed' : 'Partial Refund Processed',
          description: `Refunded $${amount.toFixed(2)} to customer. Reason: ${reason}`,
          timestamp: timeString,
          type: 'refund' as const,
        };

        return {
          ...order,
          paymentStatus: newPaymentStatus,
          timeline: [...order.timeline, timelineEvent],
        };
      })
    );

    showToast(`Refund of $${amount.toFixed(2)} processed for ${orderId}`, 'info');
  };

  const createOrderRMA = (orderId: string, reason: string) => {
    const rmaId = `RMA-${Math.floor(2000 + Math.random() * 8000)}`;
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const timelineEvent = {
          id: `EV-${Date.now().toString().slice(-4)}`,
          title: `Return Authorized (${rmaId})`,
          description: `RMA generated for return inspection. Reason: ${reason}`,
          timestamp: timeString,
          type: 'refund' as const,
        };

        return {
          ...order,
          rma: {
            id: rmaId,
            reason,
            status: 'approved',
            refundAmount: order.totalAmount,
          },
          timeline: [...order.timeline, timelineEvent],
        };
      })
    );

    showToast(`Return Authorization ${rmaId} created for order ${orderId}`, 'success');
  };

  const createNewOrder = (orderData: Partial<Order>): string => {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newId = `ORD-${Math.floor(9500 + Math.random() * 400)}`;

    const newOrder: Order = {
      id: newId,
      customerId: orderData.customerId || 'CUST-01',
      customerName: orderData.customerName || 'Elena Vance',
      customerEmail: orderData.customerEmail || 'elena.vance@lumina-tech.io',
      customerPhone: orderData.customerPhone || '+1 (415) 892-4119',
      createdAt: timeString,
      fulfillmentStatus: orderData.fulfillmentStatus || 'unfulfilled',
      paymentStatus: orderData.paymentStatus || 'paid',
      subtotal: orderData.subtotal || 189.00,
      tax: orderData.tax || 15.12,
      shippingFee: orderData.shippingFee || 0,
      discount: orderData.discount || 0,
      totalAmount: orderData.totalAmount || 204.12,
      shippingAddress: orderData.shippingAddress || {
        street: '720 Market Street, Suite 900',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'United States',
      },
      items: orderData.items || [
        {
          id: 'ITEM-NEW',
          name: 'Apex Pro Mechanical Keyboard',
          sku: 'KB-APX-87',
          quantity: 1,
          price: 189.00,
          image: '/src/assets/images/product_keyboard_1793251100235.jpg',
          variant: 'Slate Grey / Linear Switches',
        },
      ],
      timeline: [
        {
          id: `EV-${Date.now().toString().slice(-4)}`,
          title: 'Manual Order Created in OMS',
          description: 'Created by customer service representative',
          timestamp: timeString,
          type: 'placed',
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newId} created successfully`, 'success');
    return newId;
  };

  const adjustInventoryStock = (itemId: string, warehouse: 'stockMain' | 'stockWest' | 'stockEU', delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newWarehouseStock = Math.max(0, item[warehouse] + delta);
        const diff = newWarehouseStock - item[warehouse];
        return {
          ...item,
          [warehouse]: newWarehouseStock,
          totalStock: Math.max(0, item.totalStock + diff),
        };
      })
    );
    showToast(`Inventory updated for SKU`, 'info');
  };

  const resetAllData = () => {
    setTickets(INITIAL_TICKETS);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setInventory(INITIAL_INVENTORY);
    setSelectedTicketId('TICK-1042');
    setSelectedOrderId(null);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    showToast('Reset system to factory default demo data', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        selectedTicketId,
        setSelectedTicketId,
        selectedOrderId,
        setSelectedOrderId,
        tickets,
        orders,
        customers,
        inventory,
        addTicketMessage,
        updateTicketStatus,
        updateTicketPriority,
        updateTicketAgent,
        createNewTicket,
        updateOrderStatus,
        updateOrderAddress,
        issueOrderRefund,
        createOrderRMA,
        createNewOrder,
        adjustInventoryStock,
        toasts,
        dismissToast,
        showToast,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
