import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, FulfillmentStatus } from '../../types';
import { Search, Download, Plus, Eye, Truck, Package, Filter, CheckCircle2 } from 'lucide-react';

interface OrderListProps {
  onInspectOrder: (orderId: string) => void;
  onOpenNewOrder: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({ onInspectOrder, onOpenNewOrder }) => {
  const { orders, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FulfillmentStatus>('all');
  const [carrierFilter, setCarrierFilter] = useState<string>('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' ? true : order.fulfillmentStatus === statusFilter;
    const matchesCarrier = carrierFilter === 'all' ? true : order.carrier === carrierFilter;

    return matchesSearch && matchesStatus && matchesCarrier;
  });

  const exportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Status', 'Payment', 'Carrier', 'Tracking', 'Total'];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.createdAt,
      `"${o.customerName}"`,
      o.customerEmail,
      o.fulfillmentStatus,
      o.paymentStatus,
      `"${o.carrier || ''}"`,
      `"${o.trackingNumber || ''}"`,
      o.totalAmount.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omnidesk_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredOrders.length} orders to CSV`, 'success');
  };

  const getFulfillmentBadgeClass = (status: FulfillmentStatus) => {
    switch (status) {
      case 'unfulfilled':
        return 'text-amber-800 font-semibold';
      case 'processing':
        return 'text-sky-800 font-semibold';
      case 'shipped':
        return 'text-indigo-800 font-semibold';
      case 'delivered':
        return 'text-emerald-800 font-semibold';
      case 'on_hold':
        return 'text-orange-800 font-semibold';
      case 'cancelled':
        return 'text-slate-500 line-through';
      default:
        return 'text-slate-700';
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Order Management System (OMS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time fulfillment queue, carrier dispatch tracking, and financial reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenNewOrder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Segmented Status Tabs */}
        <div className="flex items-center overflow-x-auto gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          {(
            [
              { id: 'all', label: 'All Orders' },
              { id: 'unfulfilled', label: 'Unfulfilled' },
              { id: 'processing', label: 'Processing' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'on_hold', label: 'On Hold' },
            ] as const
          ).map((tab) => {
            const count = tab.id === 'all' ? orders.length : orders.filter((o) => o.fulfillmentStatus === tab.id).length;
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Carrier selector */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, customer, SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <select
            value={carrierFilter}
            onChange={(e) => setCarrierFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:outline-none cursor-pointer"
          >
            <option value="all">All Carriers</option>
            <option value="FedEx Priority">FedEx Priority</option>
            <option value="UPS Ground">UPS Ground</option>
            <option value="DHL Express">DHL Express</option>
          </select>
        </div>
      </div>

      {/* Orders High-Density Table */}
      <div className="mt-4 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Logistics / Tracking</th>
                <th className="py-3 px-4 text-right">Total ($)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-800">No orders found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      onClick={() => onInspectOrder(order.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {order.id}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {order.createdAt}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px] font-mono">
                          {order.customerEmail}
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {order.items.slice(0, 2).map((item) => (
                            <img
                              key={item.id}
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              title={`${item.name} (Qty ${item.quantity})`}
                              className="w-7 h-7 rounded object-cover border border-slate-200"
                            />
                          ))}
                          <span className="text-[11px] text-slate-600 ml-1">
                            {order.items.reduce((acc, i) => acc + i.quantity, 0)} item
                            {order.items.reduce((acc, i) => acc + i.quantity, 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>

                      {/* Fulfillment Status (clean unboxed text) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`capitalize ${getFulfillmentBadgeClass(order.fulfillmentStatus)}`}>
                          {order.fulfillmentStatus.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] uppercase text-slate-700">
                        {order.paymentStatus.replace('_', ' ')}
                      </td>

                      {/* Logistics / Carrier */}
                      <td className="py-3.5 px-4">
                        {order.carrier ? (
                          <div>
                            <div className="text-slate-800 font-medium">{order.carrier}</div>
                            <div className="font-mono text-[11px] text-slate-500 truncate max-w-[130px]">
                              {order.trackingNumber || 'Awaiting Scan'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                        ${order.totalAmount.toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectOrder(order.id);
                          }}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          <span>
            Total Volume: $
            {filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
