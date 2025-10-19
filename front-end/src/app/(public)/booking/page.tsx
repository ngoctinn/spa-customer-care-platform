"use client";

import { useRef, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FullPageLoader } from "@/components/ui/spinner";

// Import the new hook and child components
import { useBookingProcess } from "@/features/booking/hooks/useBookingProcess";
import ServiceSelection from "@/features/booking/components/ServiceSelection";
import TimeSelection from "@/features/booking/components/TimeSelection";
import CustomerInfoForm from "@/features/booking/components/CustomerInfoForm";
import Confirmation from "@/features/booking/components/Confirmation";
import TechnicianSelection from "@/features/booking/components/TechnicianSelection";
import BookingProgress from "@/features/booking/components/BookingProgress";
import PackageSelection from "@/features/booking/components/PackageSelection";

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
  const {
    step,
    bookingState,
    isPending,
    isLoadingAppointment,
    form,
    initialTreatmentId,
    rescheduleId,
    user,
    handleNextStep,
    handlePrevStep,
    handleSelectService,
    handleSelectPackage,
    handleSelectTechnician,
    handleSelectTime,
    handleCustomerInfoSubmit,
    handleConfirmBooking,
    setStep,
  } = useBookingProcess();

  const topOfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topOfContentRef.current) {
      topOfContentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  if (isLoadingAppointment) {
    return <FullPageLoader text="Đang tải thông tin lịch hẹn..." />;
  }

  const renderStep = () => {
    if (initialTreatmentId) {
      if (step === 1) {
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
