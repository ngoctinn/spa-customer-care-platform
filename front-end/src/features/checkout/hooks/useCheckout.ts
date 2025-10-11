// src/features/checkout/hooks/useCheckout.ts
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
// Giả sử bạn có các hooks và API functions này
// import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";
// import { applyPromoCode, applyRewardPoints, saveAddress } from "@/features/checkout/api";

// Kiểu dữ liệu giả lập
interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  isDefault: boolean;
}

export function useCheckout() {
  const { user } = useAuth();
  // const { data: profile } = useCustomerProfile();

  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [appliedPoints, setAppliedPoints] = useState<{
    points: number;
    value: number;
  } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách địa chỉ đã lưu khi component được mount
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      // **GIẢ LẬP GỌI API**
      // fetchSavedAddresses(user.id)
      //   .then(data => {
      //     setSavedAddresses(data);
      //     const defaultAddress = data.find(addr => addr.isDefault);
      //     if (defaultAddress) {
      //       setSelectedAddressId(defaultAddress.id);
      //     }
      //   })
      //   .catch(err => setError("Không thể tải địa chỉ đã lưu."))
      //   .finally(() => setIsLoading(false));

      // Dữ liệu giả
      const mockAddresses: Address[] = [
        {
          id: "addr1",
          name: "Nguyễn Văn A",
          phone: "0987654321",
          street: "123 Đường ABC",
          city: "TP.HCM",
          isDefault: true,
        },
        {
          id: "addr2",
          name: "Trần Thị B",
          phone: "0123456789",
          street: "456 Đường XYZ",
          city: "Hà Nội",
          isDefault: false,
        },
      ];
      setSavedAddresses(mockAddresses);
      setSelectedAddressId("addr1");
      setIsLoading(false);
    }
  }, [user]);

  // Hàm áp dụng điểm thưởng
  const handleApplyPoints = async (points: number) => {
    setIsLoading(true);
    try {
      // **GIẢ LẬP GỌI API**
      // const response = await applyRewardPoints({ userId: user.id, points });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const pointValue = points * 100; // Giả sử 1 điểm = 100đ

      setAppliedPoints({ points, value: pointValue });
      setError(null);
    } catch (err) {
      setError("Không thể áp dụng điểm thưởng.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý khi chọn một địa chỉ
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  // Hàm xử lý việc lưu địa chỉ mới (giả lập)
  const handleSaveNewAddress = async (
    newAddressData: Omit<Address, "id" | "isDefault">
  ) => {
    setIsLoading(true);
    try {
      // const savedAddress = await saveAddress({ userId: user.id, ...newAddressData });
      const savedAddress: Address = {
        ...newAddressData,
        id: "addr" + Date.now(),
        isDefault: false,
      };
      setSavedAddresses((prev) => [...prev, savedAddress]);
      setSelectedAddressId(savedAddress.id); // Tự động chọn địa chỉ mới
    } catch (err) {
      setError("Lỗi khi lưu địa chỉ mới.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    appliedPromo,
    appliedPoints,
    savedAddresses,
    selectedAddressId,
    handleApplyPoints,
    handleSelectAddress,
    handleSaveNewAddress,
  };
}
