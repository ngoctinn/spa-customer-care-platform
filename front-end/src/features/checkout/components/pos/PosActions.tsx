// src/features/checkout/components/pos/PosActions.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemSearch } from "./ItemSearch";
import { PaymentDetails } from "./PaymentDetails";

export function PosActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thanh toán</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ItemSearch />
        <PaymentDetails />
      </CardContent>
    </Card>
  );
}
