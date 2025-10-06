// src/features/booking/components/BookingSummarySheet.tsx
"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import BookingSummary from "./BookingSummary";
import { BookingState } from "../schemas";

interface BookingSummarySheetProps {
  bookingState: BookingState;
  currentStep: number;
}

export function BookingSummarySheet({
  bookingState,
  currentStep,
}: BookingSummarySheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-between text-base">
          <span>Xem tóm tắt</span>
          <ArrowUp className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader className="mb-4">
          <SheetTitle>Tóm tắt đặt lịch của bạn</SheetTitle>
        </SheetHeader>
        <BookingSummary bookingState={bookingState} currentStep={currentStep} />
      </SheetContent>
    </Sheet>
  );
}
