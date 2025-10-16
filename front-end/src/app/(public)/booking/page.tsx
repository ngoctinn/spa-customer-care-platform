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
import PackageSelection from "@/features/booking/components/PackageSelection"; // ++ THÊM IMPORT ++

// Import schemas và types
import {
  customerInfoSchema,
  CustomerInfoValues,
  BookingState,
} from "@/features/booking/schemas";
import { createAppointment } from "@/features/appointment/apis/appointment.api";
import { TreatmentPackage } from "@/features/treatment/types"; // ++ THÊM IMPORT ++

const bookingSteps = [
  { id: 1, name: "Chọn Dịch Vụ" },
  { id: 2, name: "Chọn Kỹ Thuật Viên" },
  { id: 3, name: "Chọn Thời Gian" },
  { id: 4, name: "Thông Tin Cá Nhân" },
  { id: 5, name: "Xác Nhận" },
];

const bookingStepsForPackage = [
  { id: 1, name: "Chọn Gói" },
  ...bookingSteps.slice(1), // Giữ lại các bước sau
];

export default function BookingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ++ ĐỌC PARAMS TỪ URL ++
  const initialServiceId = searchParams.get("serviceId") || undefined;
  const initialTreatmentId = searchParams.get("treatmentId") || undefined;
  const purchasedServiceId =
    searchParams.get("purchasedServiceId") || undefined;
  const sessionId = searchParams.get("sessionId") || undefined;

  const [step, setStep] = useState(1);
  const [bookingState, setBookingState] = useState<BookingState>({
    serviceId: initialServiceId,
    treatmentId: initialTreatmentId,
    purchasedServiceId: purchasedServiceId,
    sessionId: sessionId,
    technicianIds: [],
  });
  const [isPending, startTransition] = useTransition();
  const topOfContentRef = useRef<HTMLDivElement>(null);

  const form = useForm<CustomerInfoValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: { name: "", phone: "", email: "", note: "" },
  });

  // ++ LOGIC MỚI: Xử lý các luồng khác nhau ++
  useEffect(() => {
    // Luồng 1: Đặt lịch cho liệu trình đã mua
    if (initialTreatmentId) {
      setStep(1); // Bắt đầu từ bước chọn gói
    }
    // Luồng 2: Đặt lịch cho dịch vụ lẻ (mới hoặc đã mua)
    else if (initialServiceId) {
      setStep(2); // Bỏ qua bước 1, vào thẳng chọn KTV
    }
    // Luồng 3: Đặt lịch thông thường
    else {
      setStep(1);
    }
  }, [initialTreatmentId, initialServiceId]);

  useEffect(() => {
    if (topOfContentRef.current) {
      topOfContentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => prev - 1);

  // Xử lý khi chọn dịch vụ/liệu trình ở bước 1 (luồng thông thường)
  const handleSelectService = (id: string, type: "service" | "treatment") => {
    if (type === "treatment") {
      // Chuyển hướng đến trang chi tiết liệu trình để mua
      router.push(`/treatment-plans/${id}`);
      return;
    }
    setBookingState((prev) => ({
      ...prev,
      serviceId: id,
      treatmentId: undefined, // Reset treatmentId
    }));
    handleNextStep();
  };

  // ++ HÀM MỚI: Xử lý khi chọn một gói liệu trình ++
  const handleSelectPackage = (pkg: TreatmentPackage) => {
    const session = pkg.sessions.find((s) => s.id === sessionId);
    if (!session) {
      toast.error("Không tìm thấy buổi hẹn hợp lệ trong gói.");
      return;
    }

    setBookingState((prev) => ({
      ...prev,
      serviceId: (session as any).service_id, // Cần backend trả về service_id trong session
      treatmentPackageId: pkg.id,
      sessionId: session.id,
    }));
    setStep(2); // Chuyển đến bước chọn KTV
  };

  const handleSelectTechnician = (techIds: string[]) => {
    setBookingState((prev) => ({ ...prev, technicianIds: techIds }));
    handleNextStep(); // Tự động chuyển bước khi chọn xong
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
            "Cảm ơn bạn đã tin tưởng. Chúng tôi sẽ sớm liên hệ để xác nhận.",
        });
        // Chuyển hướng về trang lịch trình của tôi để xem lịch hẹn mới
        router.push("/account/my-schedule");
      } catch (error) {
        toast.error("Đặt lịch thất bại", {
          description:
            error instanceof Error
              ? error.message
              : "Đã có lỗi không mong muốn.",
        });
      }
    });
  };

  const renderStep = () => {
    // Luồng đặt từ gói liệu trình
    if (initialTreatmentId) {
      switch (step) {
        case 1:
          return (
            <PackageSelection
              treatmentId={initialTreatmentId}
              onSelect={handleSelectPackage}
            />
          );
        // Các case sau dùng chung
      }
    }

    // Luồng chung (cho dịch vụ mới, dịch vụ lẻ đã mua)
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

  const steps = initialTreatmentId ? bookingStepsForPackage : bookingSteps;

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Đặt Lịch Hẹn</h1>
        <p className="text-muted-foreground mt-2">
          Chỉ với vài bước đơn giản để có ngay một cuộc hẹn.
        </p>
      </header>
      <div ref={topOfContentRef} className="max-w-4xl mx-auto space-y-8">
        <div className="p-4 rounded-lg border card">
          <BookingProgress steps={steps} currentStep={step} />
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
