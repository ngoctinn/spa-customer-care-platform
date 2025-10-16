"use client";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Import các components đã tạo
import ServiceSelection from "@/features/booking/components/ServiceSelection";
import TimeSelection from "@/features/booking/components/TimeSelection";
import CustomerInfoForm from "@/features/booking/components/CustomerInfoForm";
import Confirmation from "@/features/booking/components/Confirmation";
import TechnicianSelection from "@/features/booking/components/TechnicianSelection";
import BookingProgress from "@/features/booking/components/BookingProgress";

// Import schemas và types
import {
  customerInfoSchema,
  CustomerInfoValues,
  BookingState, // Import BookingState đã được cập nhật
} from "@/features/booking/schemas";
import { createAppointment } from "@/features/appointment/apis/appointment.api";

const bookingSteps = [
  { id: 1, name: "Chọn Dịch Vụ" },
  { id: 2, name: "Chọn Kỹ Thuật Viên" },
  { id: 3, name: "Chọn Thời Gian" },
  { id: 4, name: "Thông Tin Cá Nhân" },
  { id: 5, name: "Xác Nhận" },
];

export default function BookingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("serviceId") || undefined;
  const router = useRouter();
  const [step, setStep] = useState(initialServiceId ? 2 : 1);
  const [bookingState, setBookingState] = useState<BookingState>({
    serviceId: initialServiceId,
    technicianIds: [],
  });

  const [isPending, startTransition] = useTransition();

  const topOfContentRef = useRef<HTMLDivElement>(null);

  const form = useForm<CustomerInfoValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: { name: "", phone: "", email: "", note: "" },
  });

  useEffect(() => {
    if (topOfContentRef.current) {
      topOfContentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => prev - 1);

  const handleSelectService = (id: string, type: "service" | "treatment") => {
    if (type === "treatment" && !user) {
      router.push(`/treatment-plans/${id}`);
      return;
    }
    setBookingState({
      ...bookingState,
      serviceId: type === "service" ? id : undefined,
      treatmentId: type === "treatment" ? id : undefined,
    });
    handleNextStep();
  };

  // Cập nhật hàm này để nhận mảng
  const handleSelectTechnician = (techIds: string[]) => {
    setBookingState((prev) => ({ ...prev, technicianIds: techIds }));
  };

  const handleSelectTime = (date?: Date, time?: string) => {
    setBookingState((prev) => ({
      ...prev,
      selectedDate: date ?? prev.selectedDate,
      selectedTime: time ?? prev.selectedTime,
    }));
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
          description:
            "Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Chúng tôi sẽ sớm liên hệ để xác nhận.",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } catch (error) {
        console.error("Lỗi khi đặt lịch:", error);
        if (error instanceof Error) {
          toast.error("Đặt lịch thất bại", { description: error.message });
        } else {
          toast.error("Đặt lịch thất bại", {
            description: "Đã có lỗi không mong muốn xảy ra.",
          });
        }
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ServiceSelection onSelect={handleSelectService} />;
      case 2:
        return (
          <TechnicianSelection
            serviceId={bookingState.serviceId!}
            selectedValues={bookingState.technicianIds}
            onSelectionChange={handleSelectTechnician}
          />
        );
      case 3:
        return (
          <TimeSelection
            serviceId={bookingState.serviceId}
            technicianIds={bookingState.technicianIds}
            selectedDate={bookingState.selectedDate}
            onDateChange={(date) =>
              handleSelectTime(date, bookingState.selectedTime)
            }
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
        return <ServiceSelection onSelect={handleSelectService} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Đặt Lịch Hẹn</h1>
        <p className="text-muted-foreground mt-2">
          Chỉ với vài bước đơn giản để có ngay một cuộc hẹn chăm sóc sức khỏe và
          sắc đẹp.
        </p>
      </header>
      <div ref={topOfContentRef} className="max-w-4xl mx-auto space-y-8">
        <div className="p-4 rounded-lg border card">
          <BookingProgress steps={bookingSteps} currentStep={step} />
        </div>
        {step > 1 && (
          <Button variant="ghost" onClick={handlePrevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
        )}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleCustomerInfoSubmit)}>
            {renderStep()}
          </form>
        </FormProvider>
        <div className="flex justify-end pt-4">
          {/* Nút "Tiếp tục" cho bước chọn nhân viên */}
          {step === 2 && (
            <Button onClick={handleNextStep} size="lg">
              Tiếp tục
            </Button>
          )}
          {step === 3 &&
            bookingState.selectedDate &&
            bookingState.selectedTime && (
              <Button onClick={handleNextStep} size="lg">
                Tiếp tục
              </Button>
            )}
          {step === 4 && (
            <Button
              onClick={form.handleSubmit(handleCustomerInfoSubmit)}
              size="lg"
            >
              Đến bước xác nhận
            </Button>
          )}
          {step === 5 && (
            <Button
              onClick={handleConfirmBooking}
              size="lg"
              disabled={isPending}
            >
              {isPending ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
