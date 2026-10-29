import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Priority, Channel } from '../../types';
import { X, MessageSquare } from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
  preselectedOrderId?: string;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  preselectedCustomerId,
  preselectedOrderId,
}) => {
  const { customers, orders, createNewTicket } = useApp();

  const [customerId, setCustomerId] = useState(preselectedCustomerId || customers[0]?.id || '');
  const [orderId, setOrderId] = useState(preselectedOrderId || '');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [channel, setChannel] = useState<Channel>('email');
  const [initialMessage, setInitialMessage] = useState('');

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const customerOrders = orders.filter((o) => o.customerId === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !subject.trim() || !initialMessage.trim()) return;

    createNewTicket(
      {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        orderId: orderId || undefined,
        subject: subject.trim(),
        priority,
        status: 'open',
        channel,
        assignedAgent: 'Alex Rivera',
        slaDueMinutes: priority === 'urgent' ? 15 : priority === 'high' ? 60 : 240,
        tags: ['manual-entry', priority],
      },
      initialMessage.trim()
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-800" />
            <h3 className="text-sm font-bold text-slate-900">Create New Support Ticket</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Account</label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setOrderId('');
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-900 focus:ring-1 focus:ring-slate-900"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email}) - {c.tier} Tier
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Link Order (Optional)</label>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-900 font-mono"
              >
                <option value="">No linked order</option>
                {customerOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} - ${o.totalAmount.toFixed(2)} ({o.fulfillmentStatus})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inbound Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-900"
              >
                <option value="email">Email</option>
                <option value="chat">Live Chat</option>
                <option value="phone">Phone / Voice</option>
                <option value="storefront">Storefront Help Desk</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-900"
              >
                <option value="urgent">Urgent (15m SLA)</option>
                <option value="high">High (1h SLA)</option>
                <option value="medium">Medium (4h SLA)</option>
                <option value="low">Low (24h SLA)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of request..."
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-900 focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Query / Initial Message</label>
            <textarea
              rows={4}
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Detailed description of customer question or issue..."
              className="w-full p-2.5 border border-slate-200 rounded text-slate-900 resize-none focus:ring-1 focus:ring-slate-900"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800"
            >
              Log Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
