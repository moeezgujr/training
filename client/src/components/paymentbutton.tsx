import { useState } from 'react';

interface PaymentButtonProps {
  amount: number;           // in PKR
  orderId: string;          // your order or course ID
  customerEmail?: string;
  customerName?: string;
}

export default function PaymentButton({
  amount,
  orderId,
  customerEmail,
  customerName,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
          customerEmail: customerEmail || 'guest@themeetingmatters.com',
          customerName: customerName || 'Guest User',
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect to SafePay payment page
        window.location.href = data.redirectUrl;
      } else {
        alert('Failed to start payment: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Something went wrong while starting payment');
      console.error('Payment start error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className={`
        w-full py-4 px-6 rounded-lg text-white font-bold text-lg
        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
        transition-colors
      `}
    >
      {loading ? 'Starting payment...' : `Pay PKR ${amount.toLocaleString()}`}
    </button>
  );
}