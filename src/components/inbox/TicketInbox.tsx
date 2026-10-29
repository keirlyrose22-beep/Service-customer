import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ticket, TicketStatus, Priority } from '../../types';
import { CANNED_MACROS } from '../../data/mockData';
import {
  Search,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Send,
  Lock,
  Package,
  ExternalLink,
  Edit2,
  RotateCcw,
  DollarSign,
  AlertCircle,
  Check,
  User,
} from 'lucide-react';

interface TicketInboxProps {
  onInspectOrder: (orderId: string) => void;
  onOpenNewTicket: () => void;
}

export const TicketInbox: React.FC<TicketInboxProps> = ({ onInspectOrder, onOpenNewTicket }) => {
  const {
    tickets,
    orders,
    customers,
    selectedTicketId,
    setSelectedTicketId,
    addTicketMessage,
    updateTicketStatus,
    updateTicketPriority,
    updateTicketAgent,
    updateOrderAddress,
    issueOrderRefund,
    createOrderRMA,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Composer state
  const [composerMode, setComposerMode] = useState<'reply' | 'internal_note'>('reply');
  const [replyText, setReplyText] = useState('');
  const [selectedMacroId, setSelectedMacroId] = useState('');

  // Address edit modal state for linked order
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editStreet, setEditStreet] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZip, setEditZip] = useState('');

  // Quick refund state
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundAmount, setRefundAmount] = useState('50.00');
  const [refundReason, setRefundReason] = useState('Courtesy goodwill for courier delay');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];
  const linkedOrder = selectedTicket?.orderId ? orders.find((o) => o.id === selectedTicket.orderId) : null;
  const linkedCustomer = customers.find((c) => c.id === selectedTicket?.customerId);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.orderId && t.orderId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' ? true : t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    addTicketMessage(selectedTicket.id, replyText.trim(), composerMode === 'internal_note');
    setReplyText('');
    setSelectedMacroId('');
  };

  const handleApplyMacro = (macroId: string) => {
    setSelectedMacroId(macroId);
    const macro = CANNED_MACROS.find((m) => m.id === macroId);
    if (macro) {
      setReplyText(macro.text);
    }
  };

  const startEditAddress = () => {
    if (!linkedOrder) return;
    setEditStreet(linkedOrder.shippingAddress.street);
    setEditCity(linkedOrder.shippingAddress.city);
    setEditState(linkedOrder.shippingAddress.state);
    setEditZip(linkedOrder.shippingAddress.zip);
    setIsEditingAddress(true);
  };

  const saveEditedAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedOrder) return;
    updateOrderAddress(linkedOrder.id, {
      ...linkedOrder.shippingAddress,
      street: editStreet,
      city: editCity,
      state: editState,
      zip: editZip,
    });
    setIsEditingAddress(false);
  };

  const executeRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedOrder) return;
    const amountNum = parseFloat(refundAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid refund amount', 'warning');
      return;
    }
    issueOrderRefund(linkedOrder.id, amountNum, refundReason);
    setIsRefunding(false);
  };

  const getChannelIcon = (ch: Ticket['channel']) => {
    switch (ch) {
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-sky-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-indigo-600" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Package className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      {/* Viewport Top Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Customer Support Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Omni-channel ticket triage with real-time order integration and Customer 360
          </p>
        </div>

        {/* Interactive Filter Tabs (Segmented Button Controls) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          {(['all', 'open', 'investigating', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap capitalize ${
                statusFilter === status
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status} {status === 'all' ? `(${tickets.length})` : `(${tickets.filter(t => t.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* Left Column: Ticket Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 flex flex-col h-[calc(100vh-190px)] min-h-[580px]">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-slate-200 flex flex-col gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, order, or customer..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <span className="font-mono tabular-nums text-slate-600">
                {filteredTickets.length} active
              </span>
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No tickets match criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="mt-2 text-xs text-slate-900 underline font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = ticket.id === selectedTicket?.id;
                const lastMsg = ticket.messages[ticket.messages.length - 1];

                return (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full text-left p-3.5 transition-colors relative flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-slate-50 ring-1 ring-inset ring-slate-300'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        {getChannelIcon(ticket.channel)}
                        <span className="font-semibold text-slate-900">{ticket.customerName}</span>
                      </div>
                      <span className="text-[11px] font-mono tabular-nums text-slate-600">
                        {ticket.createdAt.split(' ')[1]}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-800 line-clamp-1">
                      {ticket.subject}
                    </div>

                    <div className="text-xs text-slate-500 line-clamp-1">
                      {lastMsg?.text || 'No messages'}
                    </div>

                    {/* Clean unboxed metadata with dot separators */}
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono tabular-nums">
                      <span>{ticket.id}</span>
                      <span aria-hidden="true">·</span>
                      {ticket.orderId && (
                        <>
                          <span className="text-slate-700 font-medium">{ticket.orderId}</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span
                        className={
                          ticket.priority === 'urgent'
                            ? 'text-red-700 font-semibold'
                            : ticket.priority === 'high'
                            ? 'text-amber-700 font-semibold'
                            : 'text-slate-600'
                        }
                      >
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 inline text-slate-400" />
                        {ticket.slaDueMinutes}m SLA
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Active Conversation (5 cols) */}
        {selectedTicket ? (
          <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 flex flex-col h-[calc(100vh-190px)] min-h-[580px]">
            {/* Ticket Header & Status Controls */}
            <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="font-semibold text-slate-900">{selectedTicket.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{selectedTicket.channel} Channel</span>
                    {selectedTicket.orderId && (
                      <>
                        <span aria-hidden="true">·</span>
                        <button
                          onClick={() => onInspectOrder(selectedTicket.orderId!)}
                          className="text-slate-900 hover:underline font-semibold flex items-center gap-1"
                        >
                          {selectedTicket.orderId}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                  <h2 className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedTicket.subject}
                  </h2>
                </div>

                {/* Priority Selector */}
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => updateTicketPriority(selectedTicket.id, e.target.value as Priority)}
                  className={`text-xs font-semibold px-2 py-1 rounded border cursor-pointer ${
                    selectedTicket.priority === 'urgent'
                      ? 'border-red-300 text-red-700 bg-red-50'
                      : selectedTicket.priority === 'high'
                      ? 'border-amber-300 text-amber-800 bg-amber-50'
                      : 'border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <option value="urgent">Urgent Priority</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              {/* Status and Assignee bar */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <span>Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as TicketStatus)}
                    className="font-medium text-slate-900 bg-slate-50 px-2 py-1 border border-slate-200 rounded focus:outline-none cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending Customer</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <span>Assigned:</span>
                  <select
                    value={selectedTicket.assignedAgent}
                    onChange={(e) => updateTicketAgent(selectedTicket.id, e.target.value)}
                    className="font-medium text-slate-900 bg-slate-50 px-2 py-1 border border-slate-200 rounded focus:outline-none cursor-pointer"
                  >
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="Sara Lin">Sara Lin</option>
                    <option value="Jordan Hayes">Jordan Hayes</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {selectedTicket.messages.map((msg) => {
                if (msg.isInternalNote) {
                  return (
                    <div
                      key={msg.id}
                      className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-lg text-xs text-amber-950"
                    >
                      <div className="flex items-center justify-between text-amber-800 font-semibold mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-amber-700" />
                          Internal Staff Note ({msg.senderName})
                        </span>
                        <span className="font-mono tabular-nums text-[11px] text-amber-700/80">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  );
                }

                const isCustomer = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500 font-mono">
                      <span className="font-semibold text-slate-700">{msg.senderName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[88%] p-3.5 rounded-lg text-xs leading-relaxed ${
                        isCustomer
                          ? 'bg-white border border-slate-200 text-slate-900'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Response Composer */}
            <div className="p-3.5 border-t border-slate-200 bg-white">
              {/* Composer Mode Tabs */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setComposerMode('reply')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      composerMode === 'reply'
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Public Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerMode('internal_note')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                      composerMode === 'internal_note'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    Internal Note
                  </button>
                </div>

                {/* Canned Macro Quick Selector */}
                {composerMode === 'reply' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Macro:</span>
                    <select
                      value={selectedMacroId}
                      onChange={(e) => handleApplyMacro(e.target.value)}
                      className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 focus:outline-none cursor-pointer max-w-[150px] truncate"
                    >
                      <option value="">Insert Template...</option>
                      {CANNED_MACROS.map((macro) => (
                        <option key={macro.id} value={macro.id}>
                          {macro.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Textarea */}
              <form onSubmit={handleSend} className="space-y-2">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    composerMode === 'internal_note'
                      ? 'Write a private note for staff only (e.g. warehouse verification results)...'
                      : 'Type your reply to customer... (Press Cmd+Enter to send)'
                  }
                  className={`w-full p-2.5 text-xs rounded-md border resize-none focus:outline-none focus:ring-1 ${
                    composerMode === 'internal_note'
                      ? 'bg-amber-50/50 border-amber-200 focus:ring-amber-500 text-amber-950'
                      : 'bg-slate-50 border-slate-200 focus:ring-slate-900 focus:bg-white text-slate-900'
                  }`}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {composerMode === 'internal_note' ? 'Only visible to team agents' : 'Customer will receive email / chat notification'}
                  </span>

                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      !replyText.trim()
                        ? 'opacity-40 cursor-not-allowed bg-slate-300 text-slate-600'
                        : composerMode === 'internal_note'
                        ? 'bg-amber-800 text-white hover:bg-amber-900'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <Send className="w-3 h-3" />
                    <span>{composerMode === 'internal_note' ? 'Save Note' : 'Send Reply'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center h-[580px]">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No Ticket Selected</h3>
            <p className="text-xs text-slate-500 mt-1">Select a ticket from the queue or create a new request.</p>
            <button
              onClick={onOpenNewTicket}
              className="mt-4 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md"
            >
              Create New Ticket
            </button>
          </div>
        )}

        {/* Right Column: Customer 360 & Linked Order Drawer (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">
                    {linkedCustomer?.name || selectedTicket?.customerName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {linkedCustomer?.tier || 'Regular'} Tier
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-900 text-[11px] truncate max-w-[150px]">
                  {linkedCustomer?.email || selectedTicket?.customerEmail}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-slate-900 text-[11px]">
                  {linkedCustomer?.phone || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-900">{linkedCustomer?.city || 'United States'}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100 font-mono tabular-nums">
                <span className="text-slate-400">Lifetime Spend:</span>
                <span className="font-semibold text-slate-900">
                  ${(linkedCustomer?.totalSpent || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-mono tabular-nums">
                <span className="text-slate-400">Total Orders:</span>
                <span className="text-slate-900">{linkedCustomer?.totalOrders || 1}</span>
              </div>
            </div>

            {linkedCustomer?.notes && (
              <div className="mt-3 p-2 bg-slate-50 rounded text-[11px] text-slate-600 italic">
                "{linkedCustomer.notes}"
              </div>
            )}
          </div>

          {/* Linked Order Quick Panel */}
          {linkedOrder ? (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {linkedOrder.id}
                  </span>
                </div>
                <button
                  onClick={() => onInspectOrder(linkedOrder.id)}
                  className="text-xs text-slate-900 hover:underline font-semibold flex items-center gap-1"
                >
                  Inspect
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Order Status & Totals */}
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fulfillment:</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {linkedOrder.fulfillmentStatus.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment:</span>
                  <span className="font-mono uppercase text-slate-700 text-[11px]">
                    {linkedOrder.paymentStatus.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between font-mono tabular-nums">
                  <span className="text-slate-400">Order Total:</span>
                  <span className="font-bold text-slate-900">
                    ${linkedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] text-slate-400 block">Line Items:</span>
                {linkedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
                    />
                    <div className="text-xs min-w-0">
                      <p className="font-medium text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        Qty {item.quantity} · ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Address Quick Preview & Edit */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400">Shipping Address:</span>
                  <button
                    onClick={startEditAddress}
                    className="text-[11px] text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    Edit
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-snug">
                  {linkedOrder.shippingAddress.street}, {linkedOrder.shippingAddress.city},{' '}
                  {linkedOrder.shippingAddress.state} {linkedOrder.shippingAddress.zip}
                </p>
              </div>

              {/* CS Quick Action Triggers */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-semibold text-slate-700 block">
                  Quick Actions:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => setIsRefunding(true)}
                    className="px-2 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-medium flex items-center justify-center gap-1"
                  >
                    <DollarSign className="w-3 h-3" />
                    Refund
                  </button>
                  <button
                    onClick={() => createOrderRMA(linkedOrder.id, 'Customer reported issue in ticket')}
                    className="px-2 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-medium flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Return RMA
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center text-xs text-slate-500">
              <Package className="w-6 h-6 mx-auto text-slate-300 mb-2" />
              <span>No order linked to this ticket.</span>
            </div>
          )}
        </div>
      </div>

      {/* Edit Address Inline Modal */}
      {isEditingAddress && linkedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Update Shipping Address ({linkedOrder.id})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Directly updates fulfillment routing and synchronizes with carrier manifest.
            </p>

            <form onSubmit={saveEditedAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Street Address & Suite</label>
                <input
                  type="text"
                  value={editStreet}
                  onChange={(e) => setEditStreet(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={editZip}
                    onChange={(e) => setEditZip(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Refund Modal */}
      {isRefunding && linkedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Issue Refund ({linkedOrder.id})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Maximum refundable balance: ${linkedOrder.totalAmount.toFixed(2)}
            </p>

            <form onSubmit={executeRefund} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Refund Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  max={linkedOrder.totalAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reason / Note to Customer</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRefunding(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
                >
                  Process Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
