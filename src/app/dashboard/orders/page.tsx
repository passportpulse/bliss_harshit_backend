"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/FormElements/select";
import { authenticatedFetch, handleApiResponse } from "@/lib/api";

const ORDER_STATUS = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
  };
  name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface Order {
  _id: string;
  orderId: string;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingCharges: number;
  tax: number;
  totalPrice: number;
  paymentStatus: string;
  status: string;
  trackingNumber?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/ecom/orders");
      const result = await handleApiResponse(res);
      setOrders(result.orders || []);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const res = await authenticatedFetch(`/api/ecom/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await handleApiResponse(res);
      fetchOrders();
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status. Please try again.");
    }
  }

  const filteredOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🛒 Orders</h1>
      <div className="flex items-center gap-4 mb-4">
        <label className="font-medium">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded text-sm dark:bg-[#1a2332] dark:text-white"
        >
          <option value="">All</option>
          {ORDER_STATUS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-[#1a2332] dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-sm">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">{order.customerEmail}</div>
                        {order.customerPhone && (
                          <div className="text-gray-500 dark:text-gray-400">{order.customerPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₹{order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : order.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : order.status === "SHIPPED"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : ""
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order._id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="border px-2 py-1 rounded text-sm dark:bg-[#1a2332] dark:text-white"
                      >
                        {ORDER_STATUS.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expandedOrderId === order._id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Order Items */}
                          <div>
                            <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-[#1a2332] rounded border border-gray-200 dark:border-gray-700">
                                  {item.product?.images?.[0] && (
                                    <img
                                      src={item.product.images[0]}
                                      alt={item.name || item.product.name}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-medium">{item.name || item.product?.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                    </p>
                                    <p className="text-sm font-semibold mt-1">
                                      Total: ₹{(item.quantity * item.price).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 p-3 bg-white dark:bg-[#1a2332] rounded border border-gray-200 dark:border-gray-700">
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>₹{order.subtotal.toFixed(2)}</span>
                                </div>
                                {order.shippingCharges > 0 && (
                                  <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span>₹{order.shippingCharges.toFixed(2)}</span>
                                  </div>
                                )}
                                {order.tax > 0 && (
                                  <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>₹{order.tax.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <span>Total:</span>
                                  <span>₹{order.totalPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div>
                            <h3 className="font-semibold text-lg mb-3">Shipping Address</h3>
                            <div className="p-4 bg-white dark:bg-[#1a2332] rounded border border-gray-200 dark:border-gray-700">
                              <p className="font-medium">{order.shippingAddress.fullName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {order.shippingAddress.phone}
                              </p>
                              <p className="text-sm mt-2">{order.shippingAddress.street}</p>
                              <p className="text-sm">
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                              </p>
                              <p className="text-sm">{order.shippingAddress.country}</p>
                            </div>

                            {/* Payment Info */}
                            <h3 className="font-semibold text-lg mb-3 mt-6">Payment Information</h3>
                            <div className="p-4 bg-white dark:bg-[#1a2332] rounded border border-gray-200 dark:border-gray-700">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                                  <span className={`font-semibold ${
                                    order.paymentStatus === 'PAID'
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-yellow-600 dark:text-yellow-400'
                                  }`}>
                                    {order.paymentStatus}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                                  <span className="font-semibold">Razorpay</span>
                                </div>
                              </div>
                              {order.trackingNumber && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Tracking Number:</span>
                                    <span className="font-mono text-sm font-semibold">{order.trackingNumber}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 