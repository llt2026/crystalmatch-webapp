'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PaymentMethod } from '@/app/lib/payment/service';
import { OrderStatus } from '@/app/lib/subscription/types';

interface Order {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
}

interface CardInfo {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || '';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    if (!orderId) {
      setError('Invalid order ID');
      setIsLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError('');

    try {
      // In a real application, we would fetch the order details from the server
      // For this demo, we'll use a mock order
      setOrder({
        id: orderId || 'order_123',
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

  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      setCardInfo({ ...cardInfo, [name]: formatted });
      return;
    }
    
    if (name === 'expiryDate') {
      // Format expiry date as MM/YY
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      
      if (cleaned.length > 2) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
      }
      
      setCardInfo({ ...cardInfo, [name]: formatted });
      return;
    }
    
    if (name === 'cvv') {
      // Allow only numbers for CVV
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setCardInfo({ ...cardInfo, [name]: cleaned });
      return;
    }
    
    setCardInfo({ ...cardInfo, [name]: value });
  };

  const validateCardInfo = () => {
    if (selectedMethod !== PaymentMethod.CREDIT_CARD) return true;
    
    if (cardInfo.cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number');
      return false;
    }
    
    if (!cardInfo.cardholderName) {
      setError('Please enter the cardholder name');
      return false;
    }
    
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardInfo.expiryDate)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (cardInfo.cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    if (!order) return;
    
    // Validate card info for credit card payments
    if (!validateCardInfo()) {
      return;
    }
    
    setIsProcessing(true);
    setError('');

    try {
      // Get JWT token from local storage
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: selectedMethod,
          cardInfo: selectedMethod === PaymentMethod.CREDIT_CARD ? cardInfo : undefined,
          amount: order.amount,
          currency: order.currency,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment processing failed');
      }

      if (data.redirectUrl) {
        // Redirect to external payment gateway
        window.location.href = data.redirectUrl;
      } else {
        // Payment was processed successfully
        router.push('/payment/success?orderId=' + order.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
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
      <div className="max-w-4xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                {Object.values(PaymentMethod).map((method) => (
                  <div 
                    key={method}
                    className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                      selectedMethod === method
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-black/20 border-transparent hover:bg-black/30'
                    }`}
                    onClick={() => setSelectedMethod(method)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border ${
                        selectedMethod === method ? 'border-purple-500' : 'border-gray-500'
                      } mr-3 flex items-center justify-center`}>
                        {selectedMethod === method && (
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        )}
                      </div>
                      <span className="text-white font-medium">
                        {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Card Form */}
            {selectedMethod === PaymentMethod.CREDIT_CARD && (
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-xl font-semibold text-white mb-4">Card Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardInfo.cardNumber}
                      onChange={handleCardInfoChange}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      maxLength={19}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={cardInfo.cardholderName}
                      onChange={handleCardInfoChange}
                      placeholder="Name on card"
                      className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardInfo.expiryDate}
                        onChange={handleCardInfoChange}
                        placeholder="MM/YY"
                        className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        maxLength={5}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        name="cvv"
                        value={cardInfo.cvv}
                        onChange={handleCardInfoChange}
                        placeholder="•••"
                        className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/20 text-red-300 p-4 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="glass-card p-6 rounded-2xl h-fit">
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
                
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatCurrency(order.amount, order.currency)}`
                  )}
                </button>
                
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