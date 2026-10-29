import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { Search, User, Package, MessageSquare, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

interface CustomerDirectoryProps {
  onInspectOrder: (orderId: string) => void;
  onOpenTicketForCustomer: (customerId: string) => void;
}

export const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({
  onInspectOrder,
  onOpenTicketForCustomer,
}) => {
  const { customers, orders, tickets, setActiveTab, setSelectedTicketId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerOrders = orders.filter((o) => o.customerId === selectedCustomerId);
  const customerTickets = tickets.filter((t) => t.customerId === selectedCustomerId);

  const viewTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setActiveTab('inbox');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Customer 360 Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified customer profiles, purchase history, lifetime value, and support relationships
          </p>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* Customer Directory Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Tier</th>
                  <th className="py-3 px-4 text-right">Orders</th>
                  <th className="py-3 px-4 text-right">LTV Spend</th>
                  <th className="py-3 px-4 text-right">Avg Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No matching customer accounts found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const isSelected = c.id === selectedCustomerId;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCustomerId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-50 font-medium' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">
                            {c.email}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{c.city}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-[11px]">
                          <span
                            className={
                              c.tier === 'VIP'
                                ? 'text-indigo-800'
                                : c.tier === 'New'
                                ? 'text-emerald-800'
                                : 'text-slate-600'
                            }
                          >
                            {c.tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800">
                          {c.totalOrders}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                          ${c.totalSpent.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600">
                          ${c.averageOrderValue.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail & History (5 cols) */}
        {selectedCustomer ? (
          <div className="lg:col-span-5 space-y-4">
            {/* Profile Overview */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {selectedCustomer.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{selectedCustomer.name}</h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Customer Since {selectedCustomer.joinDate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenTicketForCustomer(selectedCustomer.id)}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  New Ticket
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <span className="text-slate-900 font-mono text-[11px] truncate block">
                    {selectedCustomer.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  <span className="text-slate-900 font-mono text-[11px] block">
                    {selectedCustomer.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Location</span>
                  <span className="text-slate-900 block">{selectedCustomer.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Account Tier</span>
                  <span className="text-slate-900 font-semibold block">{selectedCustomer.tier} Member</span>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="mt-3 p-3 bg-slate-50 rounded text-xs text-slate-700 italic border border-slate-100">
                  Account Notes: "{selectedCustomer.notes}"
                </div>
              )}
            </div>

            {/* Past Orders for this customer */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Order History ({customerOrders.length})
              </h3>

              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No orders found for this account.</p>
              ) : (
                <div className="space-y-2.5">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onInspectOrder(order.id)}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded border border-slate-200/80 cursor-pointer flex items-center justify-between transition-colors text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{order.id}</span>
                          <span className="capitalize text-[11px] text-slate-600">
                            · {order.fulfillmentStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {order.createdAt} · {order.items.length} item(s)
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                        <span className="block text-[11px] text-slate-500 capitalize">
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support Tickets for this customer */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Customer Service Inquiries ({customerTickets.length})
              </h3>

              {customerTickets.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No tickets on record.</p>
              ) : (
                <div className="space-y-2">
                  {customerTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => viewTicket(t.id)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200/80 cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-mono">
                        <span className="font-bold text-slate-900">{t.id}</span>
                        <span className="capitalize">{t.status}</span>
                      </div>
                      <p className="font-medium text-slate-800 line-clamp-1">{t.subject}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
