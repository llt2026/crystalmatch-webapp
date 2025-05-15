'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrderStatus } from '@/app/lib/subscription/types';

// 状态标签颜色映射
const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-500/20 text-yellow-300',
  [OrderStatus.COMPLETED]: 'bg-green-500/20 text-green-300',
  [OrderStatus.FAILED]: 'bg-red-500/20 text-red-300',
  [OrderStatus.REFUNDED]: 'bg-blue-500/20 text-blue-300',
};

// 状态名称映射
const statusNames: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.COMPLETED]: 'Completed',
  [OrderStatus.FAILED]: 'Failed',
  [OrderStatus.REFUNDED]: 'Refunded',
};

interface Order {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderHistory() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch user's order history
  const fetchOrders = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/orders');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Unable to load order history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format amount
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get plan name from ID
  const getPlanName = (planId: string) => {
    const planNames: Record<string, string> = {
      'basic': 'Basic Plan',
      'premium': 'Premium Monthly',
      'premium-yearly': 'Premium Yearly',
    };
    
    return planNames[planId] || planId;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Order History</h1>
          <Link 
            href="/dashboard" 
            className="flex items-center text-purple-300 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="glass-card p-8 rounded-2xl flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <h2 className="text-xl font-semibold text-white mb-4">No Orders Yet</h2>
            <p className="text-purple-200 mb-6">
              You haven't made any purchases yet. Explore our premium plans to enhance your crystal energy experience.
            </p>
            <Link 
              href="/subscription" 
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-colors"
            >
              View Plans
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="glass-card p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {getPlanName(order.planId)}
                    </h3>
                    <p className="text-purple-300 text-sm">
                      Order ID: {order.id.substring(0, 12)}...
                    </p>
                  </div>
                  <div className={`mt-2 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {statusNames[order.status]}
                  </div>
                </div>
                
                <div className="border-t border-purple-500/20 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-purple-300 text-xs">Amount</p>
                      <p className="text-white font-medium">
                        {formatAmount(order.amount, order.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-xs">Date</p>
                      <p className="text-white font-medium">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-xs">Payment Method</p>
                      <p className="text-white font-medium">
                        {order.paymentMethod ? 
                          order.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                          'Not Available'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {order.status === OrderStatus.PENDING && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => router.push(`/payment?orderId=${order.id}`)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors"
                    >
                      Complete Payment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 