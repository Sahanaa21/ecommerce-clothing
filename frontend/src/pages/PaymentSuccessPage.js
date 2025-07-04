import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success("✅ Payment Successful! Your order has been placed.");
    const timer = setTimeout(() => {
      navigate("/orders");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-green-50">
      <h2 className="text-4xl font-bold text-green-700 mb-4">🎉 Payment Successful!</h2>
      <p className="text-lg text-gray-700 mb-6">
        Thank you for your order. You will be redirected shortly to your order history.
      </p>
      <div className="animate-pulse text-green-600 text-6xl">✅</div>
    </div>
  );
};

export default PaymentSuccessPage;
