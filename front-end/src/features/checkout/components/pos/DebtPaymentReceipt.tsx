// src/features/checkout/components/pos/DebtPaymentReceipt.tsx
import React from "react";
import { FullCustomerProfile } from "@/features/customer/types";
import { PaymentMethod } from "@/features/checkout/types";

interface ReceiptProps {
  customer: FullCustomerProfile;
  payment: {
    amount: number;
    payment_method: PaymentMethod;
    notes?: string;
  };
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Tiền mặt",
  card: "Thẻ",
  transfer: "Chuyển khoản",
  cod: "COD",
  combined: "Nhiều phương thức",
  prepaid: "Thẻ trả trước",
  debt: "Ghi nợ",
};

export const DebtPaymentReceipt = React.forwardRef<
  HTMLDivElement,
  ReceiptProps
>(({ customer, payment }, ref) => {
  const transactionDate = new Date();
  // Số dư nợ mới đã được cập nhật trong `customer` object từ API response
  const remainingDebt = customer.debt_amount || 0;

  return (
    <div ref={ref} className="p-8 font-sans text-sm text-black bg-white">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">SERENITY SPA</h1>
        <p>123 Đường ABC, Phường X, Quận Y, TP.HCM</p>
        <p>Hotline: 0987.654.321</p>
        <h2 className="text-lg font-semibold mt-4">
          BIÊN LAI THANH TOÁN CÔNG NỢ
        </h2>
      </div>

      <div className="mb-4">
        <p>
          <strong>Ngày:</strong> {transactionDate.toLocaleString("vi-VN")}
        </p>
        <p>
          <strong>Khách hàng:</strong> {customer.full_name}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {customer.phone_number}
        </p>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-t border-b border-gray-400">
            <th className="text-left py-2">Mô tả</th>
            <th className="text-right py-2">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2">Thanh toán công nợ</td>
            <td className="text-right py-2">
              {payment.amount.toLocaleString("vi-VN")}đ
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 pt-4 border-t border-dashed border-gray-400">
        <div className="flex justify-between">
          <span>Phương thức:</span>
          <span>{paymentMethodLabels[payment.payment_method]}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2">
          <span>ĐÃ THANH TOÁN:</span>
          <span>{payment.amount.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      <div className="mt-4 pt-2">
        <div className="flex justify-between">
          <span>Công nợ còn lại:</span>
          <span className="font-semibold">
            {remainingDebt.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>

      {payment.notes && (
        <div className="mt-4 text-xs">
          <p>
            <strong>Ghi chú:</strong> {payment.notes}
          </p>
        </div>
      )}

      <div className="text-center mt-8 text-xs">
        <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
      </div>
    </div>
  );
});

DebtPaymentReceipt.displayName = "DebtPaymentReceipt";
