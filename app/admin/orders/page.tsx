'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@/app/lib/subscription/types';

// 状态标签颜色映射
const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-500/20 text-yellow-300',
  [OrderStatus.COMPLETED]: 'bg-green-500/20 text-green-300',
  [OrderStatus.FAILED]: 'bg-red-500/20 text-red-300',
  [OrderStatus.REFUNDED]: 'bg-blue-500/20 text-blue-300',
};

// 状态中文名称映射
const statusNames: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待处理',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.FAILED]: '失败',
  [OrderStatus.REFUNDED]: '已退款',
};

interface Order {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  stats: {
    totalAmount: number;
    currency: string;
  };
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError('');

    try {
      let url = `/api/admin/orders?page=${page}&limit=10`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('无法获取订单数据');
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
      setTotalOrders(data.pagination.total);
      setTotalAmount(data.stats.totalAmount);
    } catch (error) {
      console.error('获取订单失败:', error);
      setError('无法加载订单数据，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('更新订单失败');
      }

      // 刷新订单列表
      await fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('更新订单失败:', error);
      setError('无法更新订单，请稍后再试');
    } finally {
      setIsUpdating(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化金额
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // 订单详情模态框
  const OrderDetailModal = ({ order }: { order: Order }) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">订单详情</h3>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-purple-300 text-sm">订单ID</p>
                <p className="text-white font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm">用户ID</p>
                <p className="text-white font-medium">{order.userId}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm">订阅计划</p>
                <p className="text-white font-medium">{order.planId}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm">金额</p>
                <p className="text-white font-medium">{formatAmount(order.amount, order.currency)}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm">创建时间</p>
                <p className="text-white font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm">更新时间</p>
                <p className="text-white font-medium">{formatDate(order.updatedAt)}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm">状态</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                  {statusNames[order.status]}
                </div>
              </div>
              <div>
                <p className="text-purple-300 text-sm">支付方式</p>
                <p className="text-white font-medium">{order.paymentMethod || '未使用'}</p>
              </div>
            </div>

            {order.metadata && (
              <div>
                <p className="text-purple-300 text-sm mb-1">元数据</p>
                <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-auto max-h-40">
                  {JSON.stringify(order.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-4 border-t border-purple-500/20">
              <p className="text-purple-300 text-sm mb-3">更新订单状态</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(OrderStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(order.id, status)}
                    disabled={isUpdating || order.status === status}
                    className={`px-3 py-1.5 rounded text-sm ${
                      order.status === status
                        ? 'bg-purple-700 text-white cursor-not-allowed'
                        : 'bg-purple-600/40 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {statusNames[status]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">订单管理</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center text-purple-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回仪表盘
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-lg font-medium text-purple-300 mb-2">订单总数</h3>
            <p className="text-3xl font-bold text-white">{totalOrders}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-lg font-medium text-purple-300 mb-2">已完成订单金额</h3>
            <p className="text-3xl font-bold text-white">${totalAmount}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-lg font-medium text-purple-300 mb-2">筛选订单</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
              className="w-full p-2 bg-black/30 border border-purple-500/30 rounded text-white focus:border-purple-500"
            >
              <option value="">全部订单</option>
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>
                  {statusNames[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-900/30">
                  <th className="p-4 text-left text-purple-300 font-medium">订单ID</th>
                  <th className="p-4 text-left text-purple-300 font-medium">用户</th>
                  <th className="p-4 text-left text-purple-300 font-medium">计划</th>
                  <th className="p-4 text-left text-purple-300 font-medium">金额</th>
                  <th className="p-4 text-left text-purple-300 font-medium">状态</th>
                  <th className="p-4 text-left text-purple-300 font-medium">创建时间</th>
                  <th className="p-4 text-left text-purple-300 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-400">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-400">
                      没有找到订单
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-purple-900/10">
                      <td className="p-4 text-white">{order.id.substring(0, 10)}...</td>
                      <td className="p-4 text-white">{order.userId.substring(0, 10)}...</td>
                      <td className="p-4 text-white">{order.planId}</td>
                      <td className="p-4 text-white">{formatAmount(order.amount, order.currency)}</td>
                      <td className="p-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {statusNames[order.status]}
                        </div>
                      </td>
                      <td className="p-4 text-white">{formatDate(order.createdAt)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 flex justify-between items-center border-t border-purple-500/10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className={`px-3 py-1 rounded ${
                page === 1 || isLoading
                  ? 'bg-purple-700/30 text-purple-300 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              上一页
            </button>
            <span className="text-purple-300">
              第 {page} 页
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={orders.length < 10 || isLoading}
              className={`px-3 py-1 rounded ${
                orders.length < 10 || isLoading
                  ? 'bg-purple-700/30 text-purple-300 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && <OrderDetailModal order={selectedOrder} />}
    </div>
  );
} 