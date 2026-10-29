import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Minus, AlertTriangle, Layers, Building } from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { inventory, adjustInventoryStock } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Warehouse Inventory & Stock Allocation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-location stock distribution across Main DC, West Coast, and EU fulfillment hubs
          </p>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, product name, or category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Warehouse Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-slate-700">Main DC (Chicago, IL)</span>
            <Building className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {inventory.reduce((sum, item) => sum + item.stockMain, 0)} units
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Central automated distribution center</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-slate-700">West Coast Hub (Reno, NV)</span>
            <Building className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {inventory.reduce((sum, item) => sum + item.stockWest, 0)} units
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Expedited Pacific & Mountain transit</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-slate-700">EU Hub (Amsterdam, NL)</span>
            <Building className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {inventory.reduce((sum, item) => sum + item.stockEU, 0)} units
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Cross-border European logistics</p>
        </div>
      </div>

      {/* Inventory Items Grid / Table */}
      <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Main DC</th>
                <th className="py-3 px-4 text-center">West Coast</th>
                <th className="py-3 px-4 text-center">EU Hub</th>
                <th className="py-3 px-4 text-right">Total Stock</th>
                <th className="py-3 px-4 text-right">Reserved</th>
                <th className="py-3 px-4 text-right">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const available = item.totalStock - item.reserved;
                const isLowStock = available <= item.reorderPoint;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="font-mono text-[11px] text-slate-500">{item.sku}</div>
                          {isLowStock && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold mt-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock Threshold ({item.reorderPoint} unit warning)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{item.category}</td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      ${item.price.toFixed(2)}
                    </td>

                    {/* Stock Main DC with quick adjuster */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => adjustInventoryStock(item.id, 'stockMain', -1)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Decrement 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono tabular-nums font-semibold text-slate-900 w-8 text-center">
                          {item.stockMain}
                        </span>
                        <button
                          onClick={() => adjustInventoryStock(item.id, 'stockMain', 1)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Increment 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Stock West Coast */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => adjustInventoryStock(item.id, 'stockWest', -1)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Decrement 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono tabular-nums font-semibold text-slate-900 w-8 text-center">
                          {item.stockWest}
                        </span>
                        <button
                          onClick={() => adjustInventoryStock(item.id, 'stockWest', 1)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Increment 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Stock EU */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => adjustInventoryStock(item.id, 'stockEU', -1)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Decrement 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono tabular-nums font-semibold text-slate-900 w-8 text-center">
                          {item.stockEU}
                        </span>
                        <button
                          onClick={() => adjustInventoryStock(item.id, 'stockEU', 1)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Increment 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Total Stock */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {item.totalStock}
                    </td>

                    {/* Reserved */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-500">
                      {item.reserved}
                    </td>

                    {/* Available */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      <span className={isLowStock ? 'text-amber-800' : 'text-slate-900'}>
                        {available}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
