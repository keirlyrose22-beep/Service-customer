import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, FulfillmentStatus } from '../../types';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  Edit2,
  DollarSign,
  RotateCcw,
  MessageSquare,
  Copy,
} from 'lucide-react';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
  onOpenTicketForOrder?: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  orderId,
  onClose,
  onOpenTicketForOrder,
}) => {
  const { orders, updateOrderStatus, updateOrderAddress, issueOrderRefund, createOrderRMA, showToast } = useApp();

  const order = orders.find((o) => o.id === orderId);

  // Status update states
  const [selectedStatus, setSelectedStatus] = useState<FulfillmentStatus>(order?.fulfillmentStatus || 'unfulfilled');
  const [carrierInput, setCarrierInput] = useState(order?.carrier || 'FedEx Priority');
  const [trackingInput, setTrackingInput] = useState(order?.trackingNumber || '');

  // Address edit state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [street, setStreet] = useState(order?.shippingAddress.street || '');
  const [city, setCity] = useState(order?.shippingAddress.city || '');
  const [state, setState] = useState(order?.shippingAddress.state || '');
  const [zip, setZip] = useState(order?.shippingAddress.zip || '');

  // Refund state
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundAmount, setRefundAmount] = useState(order ? order.totalAmount.toFixed(2) : '0.00');
  const [refundReason, setRefundReason] = useState('Customer return request');

  // Print packing slip view state
  const [showPackingSlip, setShowPackingSlip] = useState(false);

  if (!order) return null;

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderStatus(order.id, selectedStatus, carrierInput, trackingInput);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderAddress(order.id, {
      ...order.shippingAddress,
      street,
      city,
      state,
      zip,
    });
    setIsEditingAddress(false);
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) return;
    issueOrderRefund(order.id, amount, refundReason);
    setShowRefundForm(false);
  };

  const copyTracking = () => {
    if (order.trackingNumber) {
      navigator.clipboard?.writeText(order.trackingNumber);
      showToast('Tracking number copied to clipboard', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-slate-900 flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">{order.id}</h2>
                <span className="text-xs text-slate-500 font-mono">· Placed {order.createdAt}</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className="font-semibold text-slate-700 capitalize">
                  Fulfillment: {order.fulfillmentStatus.replace('_', ' ')}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-mono uppercase text-slate-600 text-[11px]">
                  Payment: {order.paymentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPackingSlip(!showPackingSlip)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{showPackingSlip ? 'Back to Order View' : 'Packing Slip'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {showPackingSlip ? (
          /* Printable Packing Slip View */
          <div className="p-8 overflow-y-auto bg-white font-sans text-xs">
            <div className="border border-slate-200 p-8 rounded max-w-2xl mx-auto shadow-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">OMNIDESK LOGISTICS</h1>
                  <p className="text-slate-500 mt-0.5">Commercial Fulfillment Slip & Manifest</p>
                </div>
                <div className="text-right font-mono">
                  <p className="font-bold text-slate-900 text-sm">{order.id}</p>
                  <p className="text-slate-500">{order.createdAt}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Ship To:</h4>
                  <p className="text-slate-700 font-semibold">{order.customerName}</p>
                  <p className="text-slate-600">{order.shippingAddress.street}</p>
                  <p className="text-slate-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  <p className="text-slate-600">{order.shippingAddress.country}</p>
                  <p className="text-slate-500 font-mono mt-1">{order.customerPhone}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Logistics Detail:</h4>
                  <p className="text-slate-600">Carrier: {order.carrier || 'Pending Assignment'}</p>
                  <p className="text-slate-600 font-mono">Tracking: {order.trackingNumber || 'N/A'}</p>
                  <p className="text-slate-600">Fulfillment Center: Main DC Warehouse</p>
                </div>
              </div>

              <table className="w-full text-left mb-6">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 font-mono">SKU</th>
                    <th className="py-2 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-slate-900">
                        {item.name}
                        {item.variant && <span className="block text-[11px] text-slate-500">{item.variant}</span>}
                      </td>
                      <td className="py-3 font-mono text-slate-600">{item.sku}</td>
                      <td className="py-3 text-right font-bold text-slate-900 font-mono">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-center text-slate-400 text-[11px] pt-4 border-t border-slate-100">
                Thank you for your business. For customer inquiries, contact support@omnidesk.internal quoting your order number.
              </div>
            </div>
          </div>
        ) : (
          /* Normal Order View */
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Items & Timeline (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              {/* Order Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-800">
                  Purchased Items ({order.items.length})
                </div>
                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover rounded border border-slate-200 shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900">{item.name}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">{item.sku}</p>
                          {item.variant && (
                            <p className="text-[11px] text-slate-600 mt-0.5">{item.variant}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right font-mono tabular-nums text-xs">
                        <div className="text-slate-500">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                        <div className="font-bold text-slate-900">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50/70 p-4 border-t border-slate-200 space-y-1.5 text-xs font-mono tabular-nums">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping Fee</span>
                    <span>{order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Total Amount</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Carrier & Tracking Bar */}
              {order.carrier && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-slate-700" />
                    <div>
                      <span className="font-semibold text-slate-900">{order.carrier}</span>
                      <div className="flex items-center gap-1.5 font-mono text-slate-600 text-[11px] mt-0.5">
                        <span>Tracking: {order.trackingNumber || 'Pending'}</span>
                        {order.trackingNumber && (
                          <button
                            onClick={copyTracking}
                            className="text-slate-400 hover:text-slate-800 p-0.5"
                            title="Copy tracking"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {order.estimatedDelivery && (
                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <span>Estimated Delivery:</span>
                      <p className="font-semibold text-slate-800">{order.estimatedDelivery}</p>
                    </div>
                  )}
                </div>
              )}

              {/* RMA Return Notice */}
              {order.rma && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
                  <div className="flex items-center justify-between text-amber-900 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-amber-700" />
                      Active Return Authorization ({order.rma.id})
                    </span>
                    <span className="capitalize font-mono text-[11px] px-2 py-0.5 bg-amber-100 rounded">
                      {order.rma.status}
                    </span>
                  </div>
                  <p className="text-amber-800">Reason: {order.rma.reason}</p>
                  <p className="text-amber-700 font-mono mt-1">Authorized refund: ${order.rma.refundAmount.toFixed(2)}</p>
                </div>
              )}

              {/* Timeline Audit Events */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Logistics & Fulfillment Audit Trail
                </h4>
                <div className="border-l-2 border-slate-200 ml-2 space-y-4 pl-4 text-xs">
                  {order.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{event.title}</span>
                        <span className="text-[11px] font-mono tabular-nums text-slate-600">
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Customer & Management Actions (5 cols) */}
            <div className="md:col-span-5 space-y-5">
              {/* Customer Contact Details */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-xs mb-1">Customer Info</h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-semibold text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-900 text-[11px]">{order.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-900 text-[11px]">{order.customerPhone}</span>
                </div>

                {onOpenTicketForOrder && (
                  <button
                    onClick={() => onOpenTicketForOrder(order.id)}
                    className="w-full mt-2 py-1.5 px-3 bg-white border border-slate-200 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Open Support Ticket for Order
                  </button>
                )}
              </div>

              {/* Shipping Address & Editor */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">Destination Address</h4>
                  <button
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    {isEditingAddress ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {isEditingAddress ? (
                  <form onSubmit={handleAddressSubmit} className="space-y-2 mt-2">
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street Address"
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900"
                      required
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900"
                        required
                      />
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="ZIP Code"
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono focus:ring-1 focus:ring-slate-900"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-1 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800"
                    >
                      Update Shipping Route
                    </button>
                  </form>
                ) : (
                  <div className="text-slate-700 leading-relaxed">
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.zip}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                )}
              </div>

              {/* Fulfillment Dispatch Controls */}
              <form onSubmit={handleStatusSubmit} className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-3">
                <h4 className="font-bold text-slate-900">Update Fulfillment State</h4>
                <div>
                  <label className="block text-slate-600 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as FulfillmentStatus)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="unfulfilled">Unfulfilled</option>
                    <option value="processing">Processing (In Packing)</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {selectedStatus === 'shipped' && (
                  <>
                    <div>
                      <label className="block text-slate-600 mb-1">Logistics Carrier</label>
                      <select
                        value={carrierInput}
                        onChange={(e) => setCarrierInput(e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs"
                      >
                        <option value="FedEx Priority">FedEx Priority</option>
                        <option value="UPS Ground">UPS Ground</option>
                        <option value="DHL Express">DHL Express</option>
                        <option value="USPS Priority">USPS Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Tracking Number</label>
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="e.g. FX-902847291-US"
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded transition-colors"
                >
                  Save Status Change
                </button>
              </form>

              {/* Financial Actions: Refund & Return */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900">Financial & Return Actions</h4>

                {showRefundForm ? (
                  <form onSubmit={handleRefundSubmit} className="space-y-2 mt-2">
                    <div>
                      <label className="block text-slate-600 mb-0.5">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        max={order.totalAmount}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">Reason</label>
                      <input
                        type="text"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                        required
                      />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowRefundForm(false)}
                        className="w-1/2 py-1 bg-white border border-slate-200 rounded text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-1 bg-red-600 text-white rounded font-semibold hover:bg-red-700"
                      >
                        Execute
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRefundForm(true)}
                      className="py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium flex items-center justify-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Refund
                    </button>
                    <button
                      type="button"
                      onClick={() => createOrderRMA(order.id, 'Standard 30-day satisfaction return')}
                      className="py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Create RMA
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
