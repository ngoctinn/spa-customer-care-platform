"use client";
import { useAuth } from "@/features/auth/contexts/AuthContexts";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
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
import PackageSelection from "@/features/booking/components/PackageSelection";

// Import schemas và types
import {
  customerInfoSchema,
  CustomerInfoValues,
  BookingState,
} from "@/features/booking/schemas";
import {
  createAppointment,
  updateAppointment,
} from "@/features/appointment/apis/appointment.api";
import { TreatmentPackage } from "@/features/treatment/types";
import { useAppointmentById } from "@/features/appointment/hooks/useAppointments";
import { FullPageLoader } from "@/components/ui/spinner";

const bookingSteps = [
  { id: 1, name: "Chọn Dịch Vụ" },
  { id: 2, name: "Chọn Kỹ Thuật Viên" },
  { id: 3, name: "Chọn Thời Gian" },
  { id: 4, name: "Thông Tin Cá Nhân" },
  { id: 5, name: "Xác Nhận" },
];

const bookingStepsForPackage = [
  { id: 1, name: "Chọn Gói" },
  ...bookingSteps.slice(1),
];

export default function BookingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialServiceId = searchParams.get("serviceId") || undefined;
  const initialTreatmentIdParam = searchParams.get("treatmentId") || undefined;
  const purchasedServiceId =
    searchParams.get("purchasedServiceId") || undefined;
  const sessionId = searchParams.get("sessionId") || undefined;
  const rescheduleId = searchParams.get("rescheduleId") || undefined;

  const [step, setStep] = useState(1);
  const [bookingState, setBookingState] = useState<BookingState>({
    serviceId: initialServiceId,
    treatmentId: initialTreatmentIdParam,
    purchasedServiceId: purchasedServiceId,
    sessionId: sessionId,
    technicianIds: [],
  });
  const [isPending, startTransition] = useTransition();
  const topOfContentRef = useRef<HTMLDivElement>(null);
  const [initialTreatmentId, setInitialTreatmentId] = useState(
    initialTreatmentIdParam
  );

  const { data: appointmentToReschedule, isLoading: isLoadingAppointment } =
    useAppointmentById(rescheduleId!);

  const form = useForm<CustomerInfoValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: { name: "", phone: "", email: "", note: "" },
  });

  useEffect(() => {
    if (rescheduleId && appointmentToReschedule) {
      setBookingState((prev) => ({
        ...prev,
        serviceId: appointmentToReschedule.service_id,
        technicianIds: appointmentToReschedule.assigned_staff_ids || [],
        treatmentPackageId: appointmentToReschedule.treatment_package_id,
        sessionId: appointmentToReschedule.treatment_session_id,
        purchasedServiceId: undefined, // Logic for this can be added if needed
      }));
      setStep(2); // Start from technician selection
    } else if (initialTreatmentId) {
      setStep(1); // Start from package selection
    } else if (initialServiceId) {
      setStep(2); // Skip service selection, go to technician
    } else {
      setStep(1); // Normal flow
    }
  }, [
    initialTreatmentId,
    initialServiceId,
    rescheduleId,
    appointmentToReschedule,
  ]);

  useEffect(() => {
    if (topOfContentRef.current) {
      topOfContentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => prev - 1);

  const handleSelectService = (id: string, type: "service" | "treatment") => {
    if (type === "treatment") {
      setInitialTreatmentId(id); // Set state to trigger package selection flow
      setBookingState((prev) => ({ ...prev, treatmentId: id }));
      // The useEffect will handle setting the correct step
      return;
    }
    setBookingState((prev) => ({
      ...prev,
      serviceId: id,
      treatmentId: undefined,
    }));
    handleNextStep();
  };

  const handleSelectPackage = (pkg: TreatmentPackage) => {
    const session = pkg.sessions.find((s) => s.id === sessionId);
    if (!session) {
      toast.error("Không tìm thấy buổi hẹn hợp lệ trong gói.");
      return;
    }

    setBookingState((prev) => ({
      ...prev,
      serviceId: (session as any).service_id,
      treatmentPackageId: pkg.id,
      sessionId: session.id,
    }));
    setStep(2);
  };

  const handleSelectTechnician = (techIds: string[]) => {
    setBookingState((prev) => ({ ...prev, technicianIds: techIds }));
    handleNextStep();
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
        if (rescheduleId) {
          // UPDATE (RESCHEDULE) LOGIC
          await updateAppointment(rescheduleId, bookingState);
          toast.success("Thay đổi lịch hẹn thành công!", {
            description: "Chúng tôi đã cập nhật thông tin lịch hẹn của bạn.",
          });
        } else {
          // CREATE LOGIC
          await createAppointment(bookingState);
          toast.success("Đặt lịch thành công!", {
            description:
              "Cảm ơn bạn đã tin tưởng. Chúng tôi sẽ sớm liên hệ để xác nhận.",
          });
        }
        router.push("/account/my-schedule");
      } catch (error) {
        toast.error("Thao tác thất bại", {
          description:
            error instanceof Error
              ? error.message
              : "Đã có lỗi không mong muốn.",
        });
      }
    });
  };

  if (isLoadingAppointment) {
    return <FullPageLoader text="Đang tải thông tin lịch hẹn..." />;
  }

  const renderStep = () => {
    if (initialTreatmentId) {
      switch (step) {
        case 1:
          return (
            <PackageSelection
              treatmentId={initialTreatmentId}
              onSelect={handleSelectPackage}
            />
          );
      }
    }

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
        // Skip this step if rescheduling and user is logged in
        if (rescheduleId && user) {
          handleNextStep();
          return null;
        }
        return <CustomerInfoForm />;
      case 5:
        return <Confirmation bookingState={bookingState} />;
      default:
        return <ServiceSelection onSelect={handleSelectService} />;
    }
  };

  const steps = initialTreatmentId ? bookingStepsForPackage : bookingSteps;
  const headerTitle = rescheduleId ? "Thay đổi lịch hẹn" : "Đặt Lịch Hẹn";

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{headerTitle}</h1>
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
              {isPending
                ? "Đang xử lý..."
                : rescheduleId
                ? "Xác nhận thay đổi"
                : "Xác nhận & Hoàn tất"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
