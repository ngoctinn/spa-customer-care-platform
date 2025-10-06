// src/app/(public)/booking/page.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Import các components và logic cần thiết
import ServiceSelection from "@/features/booking/components/ServiceSelection";
import TimeSelection from "@/features/booking/components/TimeSelection";
import CustomerInfoForm from "@/features/booking/components/CustomerInfoForm";
import Confirmation from "@/features/booking/components/Confirmation";
import TechnicianSelection from "@/features/booking/components/TechnicianSelection";
import BookingSummary from "@/features/booking/components/BookingSummary";
import { BookingProgressBar } from "@/features/booking/components/BookingProgressBar";
import { BookingSummarySheet } from "@/features/booking/components/BookingSummarySheet";
import {
  customerInfoSchema,
  CustomerInfoValues,
  BookingState,
} from "@/features/booking/schemas";
import { createAppointment } from "@/features/appointment/apis/appointment.api";
import { useCustomerProfile } from "@/features/customer/hooks/useCustomerProfile";

// Định nghĩa các bước của quy trình
const bookingSteps = [
  { id: 1, name: "Chọn Dịch Vụ" },
  { id: 2, name: "Chọn Kỹ Thuật Viên" },
  { id: 3, name: "Chọn Thời Gian" },
  { id: 4, name: "Thông Tin Cá Nhân" },
  { id: 5, name: "Xác Nhận" },
];

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialServiceId = searchParams.get("serviceId") || undefined;

  const [currentStep, setCurrentStep] = useState(initialServiceId ? 2 : 1);
  const [bookingState, setBookingState] = useState<BookingState>({
    serviceId: initialServiceId,
    technicianId: "any",
  });

  const [isPending, startTransition] = useTransition();
  const stepContainerRef = useRef<HTMLDivElement>(null);

  const { data: customerProfile } = useCustomerProfile();

  // Cuộn đến đầu khu vực form khi chuyển bước
  useEffect(() => {
    stepContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [currentStep]);

  const form = useForm<CustomerInfoValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: { name: "", phone: "", email: "", note: "" },
  });

  useEffect(() => {
    if (customerProfile) {
      form.reset({
        name: customerProfile.full_name,
        phone: customerProfile.phone || "",
        email: customerProfile.email,
        note: "",
      });
    }
  }, [customerProfile, form]);

  const handleNextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, bookingSteps.length));
  const handlePrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSelectService = (id: string, type: "service" | "treatment") => {
    if (type === "treatment") {
      router.push(`/treatment-plans/${id}`);
      return;
    }
    setBookingState({ serviceId: id, technicianId: "any" });
    handleNextStep();
  };

  const handleSelectTechnician = (techId: string) => {
    setBookingState((prev) => ({ ...prev, technicianId: techId }));
    handleNextStep();
  };

  const handleSelectTime = (date?: Date, time?: string) => {
    const newState = {
      ...bookingState,
      selectedDate: date ?? bookingState.selectedDate,
      selectedTime: time ?? bookingState.selectedTime,
    };
    setBookingState(newState);

    if (newState.selectedDate && time) {
      handleNextStep();
    }
  };

  const handleCustomerInfoSubmit = (data: CustomerInfoValues) => {
    setBookingState((prev) => ({ ...prev, customerInfo: data }));
    handleNextStep();
  };

  const handleConfirmBooking = () => {
    startTransition(async () => {
      try {
        await createAppointment(bookingState);
        toast.success("Đặt lịch thành công!", {
          description: "Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi.",
        });
        setTimeout(() => router.push("/"), 2000);
      } catch (error) {
        toast.error("Đặt lịch thất bại", {
          description:
            error instanceof Error ? error.message : "Đã có lỗi xảy ra.",
        });
      }
    });
  };

  const renderCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <ServiceSelection onSelect={handleSelectService} />;
      case 2:
        return (
          <TechnicianSelection
            serviceId={bookingState.serviceId!}
            selectedValue={bookingState.technicianId}
            onValueChange={handleSelectTechnician}
          />
        );
      case 3:
        return (
          <TimeSelection
            serviceId={bookingState.serviceId}
            technicianId={
              bookingState.technicianId === "any"
                ? undefined
                : bookingState.technicianId
            }
            selectedDate={bookingState.selectedDate}
            onDateChange={(date) => handleSelectTime(date, undefined)}
            selectedTime={bookingState.selectedTime}
            onTimeChange={(time) =>
              handleSelectTime(bookingState.selectedDate, time)
            }
          />
        );
      case 4:
        return <CustomerInfoForm />;
      case 5:
        return <Confirmation bookingState={bookingState} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Đặt Lịch Hẹn</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Chỉ với vài bước đơn giản để có ngay một cuộc hẹn chăm sóc sức khỏe và
          sắc đẹp.
        </p>
      </header>

      {/* Tích hợp Progress Bar */}
      <div className="max-w-4xl mx-auto">
        <BookingProgressBar steps={bookingSteps} currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 items-start mt-8">
        <div className="lg:col-span-2 space-y-8" ref={stepContainerRef}>
          {currentStep > 1 && (
            <Button
              variant="ghost"
              onClick={handlePrevStep}
              className="mb-[-20px]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
          )}

          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(handleCustomerInfoSubmit)}
              className="space-y-8"
            >
              {renderCurrentStepComponent()}

              <div className="flex justify-end pt-4">
                {currentStep === 4 && (
                  <Button type="submit" size="lg">
                    Đến bước xác nhận
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button
                    onClick={handleConfirmBooking}
                    size="lg"
                    disabled={isPending}
                  >
                    {isPending ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>

        <div className="hidden lg:block lg:sticky lg:top-24 mt-8 lg:mt-0">
          <BookingSummary
            bookingState={bookingState}
            currentStep={currentStep}
          />
        </div>
      </div>
      <div className="lg:hidden sticky bottom-0 bg-background border-t p-4 shadow-lg">
        <BookingSummarySheet
          bookingState={bookingState}
          currentStep={currentStep}
        />
      </div>
    </div>
  );
}
