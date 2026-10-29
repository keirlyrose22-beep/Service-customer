import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, UserCheck, Plus, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenNewTicket: () => void;
  onOpenNewOrder: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTicket, onOpenNewOrder }) => {
  const { viewMode, setViewMode, activeTab, setActiveTab, resetAllData } = useApp();

  const navItems: Array<{ id: typeof activeTab; label: string }> = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'orders', label: 'Orders' },
    { id: 'pipeline', label: 'Fulfillment' },
    { id: 'customers', label: 'Customers' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            OD
          </div>
          <button
            onClick={() => {
              setViewMode('agent');
              setActiveTab('inbox');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-slate-700 transition-colors"
          >
            OmniDesk
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed, active indicator) */}
        {viewMode === 'agent' ? (
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-slate-900 font-semibold after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-[2px] after:bg-slate-900'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="text-sm text-slate-500 font-medium">
            Customer Self-Service & Tracking Portal
          </div>
        )}

        {/* Zone 3: Primary Action & Mode Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {viewMode === 'agent' ? (
            <>
              <button
                onClick={resetAllData}
                title="Reset demo data"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={onOpenNewTicket}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Ticket</span>
                </button>
                <button
                  onClick={onOpenNewOrder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Order</span>
                </button>
              </div>

              <button
                onClick={() => setViewMode('customer_portal')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                title="Switch to customer perspective"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>Customer Portal</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setViewMode('agent')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Back to Agent Desk</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Nav Bar */}
      {viewMode === 'agent' && (
        <div className="lg:hidden flex items-center overflow-x-auto gap-4 px-6 py-2.5 bg-slate-50 border-t border-slate-200 text-xs font-medium">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 px-2 rounded ${
                activeTab === item.id ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
