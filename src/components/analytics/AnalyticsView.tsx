import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, CheckCircle2, TrendingUp, RotateCcw, Truck, MessageSquare, AlertCircle } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { tickets, orders } = useApp();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const deliveredCount = orders.filter((o) => o.fulfillmentStatus === 'delivered').length;
  const returnedCount = orders.filter((o) => o.rma !== undefined).length;
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'investigating').length;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Service Performance & Operations Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time service level agreement (SLA) metrics, fulfillment velocity, and support quality
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium text-slate-700">First Response Time</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            8m 14s
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
            3.2m faster than 15m SLA target
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium text-slate-700">SLA Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            96.8%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across 42 priority support tickets this week
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium text-slate-700">Fulfillment Turnaround</span>
            <Truck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            18.2h
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
            Average time from order paid to carrier scan
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium text-slate-700">Return / RMA Rate</span>
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            2.4%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Industry benchmark: &lt; 5.0%
          </p>
        </div>
      </div>

      {/* Operational Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Support Channel & Resolution Overview */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Support Channel Distribution & Workload
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-medium">Live Chat & Storefront</span>
                <span className="font-mono tabular-nums text-slate-900 font-bold">52% (48 tickets)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-slate-900 h-2 rounded-full" style={{ width: '52%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-medium">Email Inbound</span>
                <span className="font-mono tabular-nums text-slate-900 font-bold">36% (33 tickets)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-slate-700 h-2 rounded-full" style={{ width: '36%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-medium">Voice / VIP Phone</span>
                <span className="font-mono tabular-nums text-slate-900 font-bold">12% (11 tickets)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-slate-500 h-2 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">CSAT Score</span>
              <span className="font-mono font-bold text-slate-900 text-sm">4.89 / 5.0</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Active Backlog</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{openTickets} open</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Resolution Rate</span>
              <span className="font-mono font-bold text-slate-900 text-sm">94.1%</span>
            </div>
          </div>
        </div>

        {/* Fulfillment & Carrier Performance */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Logistics & Carrier Delivery Speed
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">FedEx Priority Courier</span>
                <span className="text-[11px] text-slate-500">Next-day & 2-day domestic air transit</span>
              </div>
              <div className="text-right font-mono tabular-nums">
                <span className="font-bold text-slate-900 block">1.3 days avg</span>
                <span className="text-emerald-700 text-[11px]">99.2% on-time</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">UPS Ground Freight</span>
                <span className="text-[11px] text-slate-500">Standard continental US ground freight</span>
              </div>
              <div className="text-right font-mono tabular-nums">
                <span className="font-bold text-slate-900 block">3.1 days avg</span>
                <span className="text-emerald-700 text-[11px]">96.8% on-time</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">DHL International Express</span>
                <span className="text-[11px] text-slate-500">Global cross-border customs expedited</span>
              </div>
              <div className="text-right font-mono tabular-nums">
                <span className="font-bold text-slate-900 block">2.8 days avg</span>
                <span className="text-emerald-700 text-[11px]">98.0% on-time</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono tabular-nums">
            <span>Gross Sales Processed: ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span>Total Orders: {totalOrders}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
