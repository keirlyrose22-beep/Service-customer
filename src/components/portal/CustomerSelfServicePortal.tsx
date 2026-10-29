import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Package, Truck, CheckCircle2, Clock, Send, RotateCcw, Printer, ArrowLeft, AlertCircle } from 'lucide-react';

export const CustomerSelfServicePortal: React.FC = () => {
  const { orders, tickets, createNewTicket, addTicketMessage, createOrderRMA, showToast, setViewMode } = useApp();

  const [searchOrderId, setSearchOrderId] = useState('ORD-9482');
  const [activeOrderNumber, setActiveOrderNumber] = useState('ORD-9482');
  
  // Support message form inside portal
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubject, setSupportSubject] = useState('Question about my shipment');

  // RMA return state
  const [showRmaModal, setShowRmaModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Changed mind / want to exchange');

  const currentOrder = orders.find((o) => o.id.toUpperCase() === activeOrderNumber.toUpperCase()) || orders[0];
  const linkedTickets = tickets.filter((t) => t.orderId === currentOrder?.id);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;
    const found = orders.find((o) => o.id.toLowerCase() === searchOrderId.trim().toLowerCase());
    if (found) {
      setActiveOrderNumber(found.id);
      showToast(`Loaded tracking for order ${found.id}`, 'success');
    } else {
      showToast(`Order "${searchOrderId}" not found in system`, 'warning');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim() || !currentOrder) return;

    // If there is an existing open ticket for this order, append message to it; otherwise create new ticket
    const openTicket = linkedTickets.find((t) => t.status !== 'closed');
    if (openTicket) {
      const now = new Date();
      const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      addTicketMessage(openTicket.id, supportMessage.trim(), false);
      showToast('Message sent to customer service agent', 'success');
    } else {
      createNewTicket(
        {
          customerId: currentOrder.customerId,
          customerName: currentOrder.customerName,
          customerEmail: currentOrder.customerEmail,
          orderId: currentOrder.id,
          subject: supportSubject,
          priority: 'medium',
          status: 'open',
          channel: 'chat',
          assignedAgent: 'Alex Rivera',
          slaDueMinutes: 60,
          tags: ['portal-inquiry', 'customer-initiated'],
        },
        supportMessage.trim()
      );
      showToast('Support inquiry created! An agent has been alerted.', 'success');
    }

    setSupportMessage('');
  };

  const submitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;
    createOrderRMA(currentOrder.id, returnReason);
    setShowRmaModal(false);
    showToast('Return RMA generated! Prepaid shipping instructions created.', 'success');
  };

  // Determine stage progress step
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'unfulfilled':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentStage = currentOrder ? getStageIndex(currentOrder.fulfillmentStatus) : 1;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Portal Breadcrumb & Top Bar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Track Order & Self-Service
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant parcel tracking, delivery updates, returns, and support inquiry
            </p>
          </div>

          <button
            onClick={() => setViewMode('agent')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Agent Operations Desk</span>
          </button>
        </div>

        {/* Order Lookup Search Box */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs mb-6">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g. ORD-9482, ORD-9481)..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
            >
              Track Package
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Sample orders:</span>
            {orders.slice(0, 4).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSearchOrderId(o.id);
                  setActiveOrderNumber(o.id);
                }}
                className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
                  activeOrderNumber === o.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {o.id} ({o.fulfillmentStatus})
              </button>
            ))}
          </div>
        </div>

        {currentOrder ? (
          <div className="space-y-6">
            {/* Tracking Progress Stepper Card */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 font-mono">
                      Order {currentOrder.id}
                    </h2>
                    <span className="text-xs text-slate-500">
                      · Placed on {currentOrder.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Recipient: <span className="font-semibold text-slate-800">{currentOrder.customerName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRmaModal(true)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return / Exchange</span>
                  </button>
                </div>
              </div>

              {/* Step indicator */}
              <div className="pt-8 pb-4">
                <div className="grid grid-cols-4 gap-2 relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                  <div
                    className="absolute top-4 left-6 h-0.5 bg-slate-900 transition-all duration-500 -z-0"
                    style={{
                      width:
                        currentStage === 1
                          ? '0%'
                          : currentStage === 2
                          ? '33%'
                          : currentStage === 3
                          ? '66%'
                          : '100%',
                    }}
                  />

                  {/* Step 1: Placed */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        currentStage >= 1
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 mt-2">Order Confirmed</span>
                    <span className="text-[11px] text-slate-500 font-mono">Payment Captured</span>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        currentStage >= 2
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 mt-2">Picking & QA</span>
                    <span className="text-[11px] text-slate-500 font-mono">Main DC Facility</span>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        currentStage >= 3
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 mt-2">In Transit</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {currentOrder.carrier || 'Carrier Assigned'}
                    </span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        currentStage >= 4
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 mt-2">Delivered</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {currentStage >= 4 ? 'Signed For' : 'Est. Delivery Soon'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Carrier Details Bar */}
              {currentOrder.carrier && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                  <div>
                    <span className="text-slate-500 block">Carrier Service:</span>
                    <span className="font-semibold text-slate-900">{currentOrder.carrier}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tracking Number:</span>
                    <span className="font-mono font-bold text-slate-900">{currentOrder.trackingNumber}</span>
                  </div>
                  {currentOrder.estimatedDelivery && (
                    <div>
                      <span className="text-slate-500 block">Estimated Arrival:</span>
                      <span className="font-mono font-semibold text-emerald-800">
                        {currentOrder.estimatedDelivery}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Items & Destination Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Items Card (7 cols) */}
              <div className="md:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Purchased Items ({currentOrder.items.length})
                </h3>

                <div className="divide-y divide-slate-100">
                  {currentOrder.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{item.sku}</p>
                          {item.variant && <p className="text-[11px] text-slate-600">{item.variant}</p>}
                        </div>
                      </div>

                      <div className="text-right font-mono tabular-nums">
                        <div className="text-slate-500">Qty {item.quantity}</div>
                        <div className="font-bold text-slate-900">${(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between font-mono tabular-nums text-xs font-bold text-slate-900">
                  <span>Total Paid:</span>
                  <span>${currentOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Destination Address & Support Desk Box (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs text-xs">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Shipping Destination
                  </h3>
                  <p className="text-slate-800 font-medium">{currentOrder.customerName}</p>
                  <p className="text-slate-600 mt-0.5">{currentOrder.shippingAddress.street}</p>
                  <p className="text-slate-600">
                    {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}{' '}
                    {currentOrder.shippingAddress.zip}
                  </p>
                  <p className="text-slate-500 mt-1 font-mono text-[11px]">{currentOrder.customerEmail}</p>
                </div>

                {/* Return RMA details if active */}
                {currentOrder.rma && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-xs">
                    <h4 className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                      Return Authorization Active ({currentOrder.rma.id})
                    </h4>
                    <p className="text-amber-800 text-[11px]">Reason: {currentOrder.rma.reason}</p>
                    <p className="text-amber-900 font-semibold mt-1">Status: {currentOrder.rma.status.toUpperCase()}</p>
                  </div>
                )}

                {/* Instant Support Form */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs text-xs">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Need Help With This Order?
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Submit a query directly to our dedicated customer support team.
                  </p>

                  <form onSubmit={handleSendMessage} className="space-y-2.5">
                    <div>
                      <input
                        type="text"
                        value={supportSubject}
                        onChange={(e) => setSupportSubject(e.target.value)}
                        placeholder="Subject / inquiry type"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <textarea
                        rows={3}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Describe your request or issue..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-xs resize-none focus:ring-1 focus:ring-slate-900"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!supportMessage.trim()}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <Send className="w-3 h-3" />
                      <span>Message Customer Service</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* RMA Return Modal */}
        {showRmaModal && currentOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Initiate Return / RMA for {currentOrder.id}
              </h3>
              <p className="text-slate-500 mb-4">
                We accept returns within 30 days of delivery. Prepaid return courier labels are automatically emailed.
              </p>

              <form onSubmit={submitReturn} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Reason for Return</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Changed mind / want to exchange">Changed mind / want to exchange</option>
                    <option value="Defective / hardware issue">Defective / hardware issue</option>
                    <option value="Ordered incorrect size / model">Ordered incorrect size / model</option>
                    <option value="Package arrived damaged in transit">Package arrived damaged in transit</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-0.5">Estimated Refund:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ${currentOrder.totalAmount.toFixed(2)} USD
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Credited back to original payment method.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRmaModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800"
                  >
                    Generate Return Label
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
