// src/features/checkout/components/AddressManager.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

// Kiểu dữ liệu giả lập, bạn sẽ thay thế bằng kiểu dữ liệu từ API
interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  savedAddresses: Address[];
  selectedAddressId: string | undefined;
  onSelectAddress: (addressId: string) => void;
  onAddNewAddress: () => void; // Hàm để mở modal/form thêm địa chỉ mới
}

export function AddressManager({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}: AddressManagerProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Địa chỉ đã lưu</CardTitle>
        <Button variant="ghost" size="sm" onClick={onAddNewAddress}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm địa chỉ mới
        </Button>
      </CardHeader>
      <CardContent>
        {savedAddresses.length > 0 ? (
          <RadioGroup
            value={selectedAddressId}
            onValueChange={onSelectAddress}
            className="space-y-4"
          >
            {savedAddresses.map((address) => (
              <Label
                key={address.id}
                htmlFor={address.id}
                className={`flex items-start gap-4 rounded-md border p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedAddressId === address.id ? "border-primary" : ""
                }`}
              >
                <RadioGroupItem value={address.id} id={address.id} />
                <div className="text-sm">
                  <p className="font-semibold">
                    {address.name}{" "}
                    {address.isDefault && (
                      <span className="text-xs text-muted-foreground">
                        (Mặc định)
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground">{address.phone}</p>
                  <p className="text-muted-foreground">{`${address.street}, ${address.city}`}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Bạn chưa có địa chỉ nào được lưu.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
