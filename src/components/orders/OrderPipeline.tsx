import React from 'react';
import { useApp } from '../../context/AppContext';
import { Order, FulfillmentStatus } from '../../types';
import { ArrowRight, CheckCircle2, Clock, Truck, Package, AlertCircle } from 'lucide-react';

interface OrderPipelineProps {
  onInspectOrder: (orderId: string) => void;
}

export const OrderPipeline: React.FC<OrderPipelineProps> = ({ onInspectOrder }) => {
  const { orders, updateOrderStatus } = useApp();

  const columns: Array<{
    id: FulfillmentStatus;
    title: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'unfulfilled',
      title: 'Unfulfilled',
      description: 'Awaiting warehouse pick allocation',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
    },
    {
      id: 'processing',
      title: 'Processing & Pick',
      description: 'Items picking, packaging & QA inspection',
      icon: <Package className="w-4 h-4 text-sky-600" />,
    },
    {
      id: 'shipped',
      title: 'Shipped (In Transit)',
      description: 'Dispatched via carrier logistics',
      icon: <Truck className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Final delivery confirmed by courier',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
  ];

  const advanceOrder = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (order.fulfillmentStatus) {
      case 'unfulfilled':
        updateOrderStatus(order.id, 'processing');
        break;
      case 'processing':
        updateOrderStatus(order.id, 'shipped', 'FedEx Priority', `FX-${Math.floor(100000000 + Math.random() * 900000000)}-US`);
        break;
      case 'shipped':
        updateOrderStatus(order.id, 'delivered');
        break;
      default:
        break;
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Fulfillment Pipeline Board
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Visual workflow tracking orders from allocation to final customer delivery
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 items-start">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.fulfillmentStatus === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-100/70 border border-slate-200 rounded-lg flex flex-col min-h-[600px] overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <span className="text-xs font-bold text-slate-900">{col.title}</span>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded tabular-nums">
                  {colOrders.length}
                </span>
              </div>

              {/* Column Subtitle */}
              <div className="px-3.5 py-2 bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-500">
                {col.description}
              </div>

              {/* Order Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {colOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No orders in this stage
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onInspectOrder(order.id)}
                      className="p-3.5 bg-white rounded-md border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-900">{order.id}</span>
                        <span className="font-mono tabular-nums text-[11px] text-slate-600">
                          {order.createdAt.split(' ')[0]}
                        </span>
                      </div>

                      <div className="text-xs">
                        <div className="font-medium text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                      </div>

                      {/* Items thumbnails */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {order.items.map((item) => (
                            <img
                              key={item.id}
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded object-cover border border-white"
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {order.items.length} SKU{order.items.length > 1 ? 's' : ''}
                        </span>
                        <span className="ml-auto font-mono font-bold text-xs text-slate-900 tabular-nums">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Logistics Carrier Info */}
                      {order.carrier && (
                        <div className="text-[11px] text-slate-600 font-mono flex items-center justify-between bg-slate-50 p-1.5 rounded">
                          <span className="truncate">{order.carrier}</span>
                          <span className="text-slate-600 truncate max-w-[90px]">{order.trackingNumber}</span>
                        </div>
                      )}

                      {/* Advance Stage Button */}
                      {col.id !== 'delivered' && (
                        <button
                          onClick={(e) => advanceOrder(order, e)}
                          className="w-full mt-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>
                            {col.id === 'unfulfilled'
                              ? 'Move to Pick & Pack'
                              : col.id === 'processing'
                              ? 'Dispatch & Ship'
                              : 'Mark Delivered'}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
