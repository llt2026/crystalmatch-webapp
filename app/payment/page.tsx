'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PaymentMethod } from '@/app/lib/payment/service';
import { OrderStatus } from '@/app/lib/subscription/types';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface Order {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
}

// 创建一个包含useSearchParams的子组件
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams?.get('orderId') || '';
  const planParam = searchParams?.get('plan') || '';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMethod] = useState<PaymentMethod>(PaymentMethod.PAYPAL);

  useEffect(() => {
    if (orderIdParam) {
      fetchOrderDetails();
      return;
    }

    if (planParam) {
      const amount = planParam === 'yearly' ? 49.99 : planParam === 'monthly' ? 4.99 : 0;
      setOrder({
        id: `temp_${Date.now()}`,
        planId: planParam,
        amount,
        currency: 'USD',
        status: OrderStatus.PENDING,
      });
      setIsLoading(false);
      return;
    }

    setError('Invalid order ID');
    setIsLoading(false);
  }, [orderIdParam, planParam]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError('');

    try {
      // In a real application, we would fetch the order details from the server
      // For this demo, we'll use a mock order
      setOrder({
        id: orderIdParam || 'order_123',
        planId: 'premium',
        amount: 99,
        currency: 'USD',
        status: OrderStatus.PENDING,
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-xl max-w-md w-full text-center">
          <div className="text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Payment Error</h2>
          <p className="text-purple-200 mb-6">{error}</p>
          <Link 
            href="/subscription"
            className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Payment</h1>
          <Link 
            href="/orders" 
            className="flex items-center text-purple-300 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Orders
          </Link>
        </div>

        {error && (
          <div className="mb-6">
            <div className="bg-red-500/20 text-red-300 p-4 rounded-lg text-center">
              {error}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <div className="glass-card p-6 rounded-2xl h-fit max-w-md w-full">
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            
            {order && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-purple-200">Plan</span>
                  <span className="text-white font-medium">
                    {order.planId.charAt(0).toUpperCase() + order.planId.slice(1)}
                  </span>
                </div>
                
                <div className="border-t border-purple-500/20 my-4"></div>
                
                <div className="flex justify-between">
                  <span className="text-purple-200">Subtotal</span>
                  <span className="text-white font-medium">
                    {formatCurrency(order.amount, order.currency)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-purple-200">Tax</span>
                  <span className="text-white font-medium">
                    {formatCurrency(0, order.currency)}
                  </span>
                </div>
                
                <div className="border-t border-purple-500/20 my-4"></div>
                
                <div className="flex justify-between">
                  <span className="text-purple-200 font-semibold">Total</span>
                  <span className="text-white font-bold">
                    {formatCurrency(order.amount, order.currency)}
                  </span>
                </div>
                
                <div className="mt-6">
                  <PayPalScriptProvider
                    options={{
                      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                      currency: order.currency,
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: 'vertical' }}
                      createOrder={async () => {
                        const res = await fetch('/api/paypal/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            orderId: order.id,
                            amount: order.amount,
                            currency: order.currency,
                          }),
                        });
                        const data = await res.json();
                        return data.id;
                      }}
                      onApprove={async (data: any) => {
                        await fetch('/api/paypal/capture-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderID: data.orderID }),
                        });
                        router.push('/payment/success?orderId=' + order.id);
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
                
                <p className="text-purple-300 text-xs text-center mt-4">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// 主页面组件使用Suspense包装子组件
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
} 