import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Package, Plus, Trash2 } from 'lucide-react';
import { OrderItem } from '../../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { customers, inventory, createNewOrder, showToast } = useApp();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [selectedSku, setSelectedSku] = useState(inventory[0]?.sku || '');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: 'ITEM-INIT',
      name: inventory[0]?.name || 'Apex Pro Mechanical Keyboard',
      sku: inventory[0]?.sku || 'KB-APX-87',
      quantity: 1,
      price: inventory[0]?.price || 189.00,
      image: inventory[0]?.image || '',
      variant: 'Slate Grey / Linear Switches',
    },
  ]);

  const [street, setStreet] = useState('500 Howard Street, Suite 300');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94105');

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const addItem = () => {
    const inv = inventory.find((i) => i.sku === selectedSku);
    if (!inv) return;

    setOrderItems((prev) => [
      ...prev,
      {
        id: `ITEM-${Date.now().toString().slice(-4)}`,
        name: inv.name,
        sku: inv.sku,
        quantity: itemQuantity,
        price: inv.price,
        image: inv.image,
      },
    ]);
    showToast(`Added ${inv.name} to order draft`, 'info');
  };

  const removeItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 300 ? 0 : 15.00;
  const total = subtotal + tax + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || orderItems.length === 0) {
      showToast('Please add at least one line item', 'warning');
      return;
    }

    createNewOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      customerPhone: selectedCustomer.phone,
      subtotal,
      tax,
      shippingFee: shipping,
      discount: 0,
      totalAmount: total,
      shippingAddress: {
        street,
        city,
        state,
        zip,
        country: 'United States',
      },
      items: orderItems,
      fulfillmentStatus: 'unfulfilled',
      paymentStatus: 'paid',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-xl w-full p-6 text-xs max-h-[90vh] overflow-y-auto my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-800" />
            <h3 className="text-sm font-bold text-slate-900">Create New Customer Order (OMS)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-900 focus:ring-1 focus:ring-slate-900"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email}) - {c.city}
                </option>
              ))}
            </select>
          </div>

          {/* Add Line Item Box */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="block font-semibold text-slate-800 mb-2">Add Inventory Item</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
              >
                {inventory.map((inv) => (
                  <option key={inv.sku} value={inv.sku}>
                    {inv.name} (${inv.price.toFixed(2)}) - {inv.totalStock} in stock
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={10}
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded text-center font-mono"
              />
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Selected Line Items */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Order Items ({orderItems.length})
            </label>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-white">
              {orderItems.map((item, idx) => (
                <div key={item.id + idx} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">
                      ${(item.quantity * item.price).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Shipping Destination</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street address"
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded"
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="px-2.5 py-1.5 border border-slate-200 rounded"
                required
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="px-2.5 py-1.5 border border-slate-200 rounded"
                required
              />
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="ZIP"
                className="px-2.5 py-1.5 border border-slate-200 rounded font-mono"
                required
              />
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono tabular-nums text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900 text-sm">
              <span>Total Charge:</span>
              <span>${total.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
