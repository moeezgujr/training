import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentButtonProps {
  amount: number;
  orderId: string;
  courseId: string;
  customerEmail?: string;
  customerName?: string;
}

export default function PaymentButton({
  amount,
  orderId,
  courseId,
  customerEmail,
  customerName,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, orderId, courseId, customerEmail, customerName }),
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && data.sessionId) {
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        alert('Failed to start payment: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Something went wrong while starting payment');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg
        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
        transition-colors`}
    >
      {loading ? 'Starting payment...' : `Pay PKR ${amount.toLocaleString()}`}
    </button>
  );
}