import { OrderHistoryList } from "@/features/customer/components/dashboard/OrderHistoryList";

export default function OrderHistoryPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Lịch sử mua hàng</h2>
        <p className="text-muted-foreground mt-1">
          Theo dõi các đơn hàng sản phẩm và dịch vụ của bạn.
        </p>
      </header>
      <OrderHistoryList />
    </div>
  );
}
