import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { TicketInbox } from './components/inbox/TicketInbox';
import { OrderList } from './components/orders/OrderList';
import { OrderPipeline } from './components/orders/OrderPipeline';
import { CustomerDirectory } from './components/customers/CustomerDirectory';
import { InventoryManager } from './components/inventory/InventoryManager';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { CustomerSelfServicePortal } from './components/portal/CustomerSelfServicePortal';
import { OrderDetailModal } from './components/orders/OrderDetailModal';
import { NewTicketModal } from './components/modals/NewTicketModal';
import { NewOrderModal } from './components/modals/NewOrderModal';
import { ToastContainer } from './components/ui/ToastContainer';

const MainApp: React.FC = () => {
  const { viewMode, activeTab, setActiveTab, setSelectedTicketId, createNewTicket } = useApp();

  const [inspectingOrderId, setInspectingOrderId] = useState<string | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | undefined>(undefined);
  const [preselectedOrderId, setPreselectedOrderId] = useState<string | undefined>(undefined);

  const handleInspectOrder = (orderId: string) => {
    setInspectingOrderId(orderId);
  };

  const handleOpenTicketForCustomer = (customerId: string) => {
    setPreselectedCustomerId(customerId);
    setPreselectedOrderId(undefined);
    setIsNewTicketOpen(true);
  };

  const handleOpenTicketForOrder = (orderId: string) => {
    setPreselectedOrderId(orderId);
    setInspectingOrderId(null);
    setIsNewTicketOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenNewTicket={() => {
          setPreselectedCustomerId(undefined);
          setPreselectedOrderId(undefined);
          setIsNewTicketOpen(true);
        }}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {viewMode === 'customer_portal' ? (
          <CustomerSelfServicePortal />
        ) : (
          <>
            {activeTab === 'inbox' && (
              <TicketInbox
                onInspectOrder={handleInspectOrder}
                onOpenNewTicket={() => {
                  setPreselectedCustomerId(undefined);
                  setPreselectedOrderId(undefined);
                  setIsNewTicketOpen(true);
                }}
              />
            )}
            {activeTab === 'orders' && (
              <OrderList
                onInspectOrder={handleInspectOrder}
                onOpenNewOrder={() => setIsNewOrderOpen(true)}
              />
            )}
            {activeTab === 'pipeline' && (
              <OrderPipeline onInspectOrder={handleInspectOrder} />
            )}
            {activeTab === 'customers' && (
              <CustomerDirectory
                onInspectOrder={handleInspectOrder}
                onOpenTicketForCustomer={handleOpenTicketForCustomer}
              />
            )}
            {activeTab === 'inventory' && <InventoryManager />}
            {activeTab === 'analytics' && <AnalyticsView />}
          </>
        )}
      </main>

      {/* Deep Order Inspection Modal */}
      {inspectingOrderId && (
        <OrderDetailModal
          orderId={inspectingOrderId}
          onClose={() => setInspectingOrderId(null)}
          onOpenTicketForOrder={handleOpenTicketForOrder}
        />
      )}

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        preselectedCustomerId={preselectedCustomerId}
        preselectedOrderId={preselectedOrderId}
      />

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />

      {/* Toast Feedbacks */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
