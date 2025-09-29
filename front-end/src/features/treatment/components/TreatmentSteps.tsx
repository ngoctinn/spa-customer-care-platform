// src/features/treatment/components/TreatmentSteps.tsx
import { TreatmentPlan } from "@/features/treatment/types";
import { Service } from "@/features/service/types";

interface TreatmentStepsProps {
  plan: TreatmentPlan;
  allServices: Service[];
}

export default function TreatmentSteps({
  plan,
  allServices,
}: TreatmentStepsProps) {
  const getServiceName = (serviceId: string) => {
    const service = allServices.find((s) => s.id === serviceId);
    return service ? service.name : "Dịch vụ không xác định";
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Các bước liệu trình</h2>
      <div className="space-y-4">
        {plan.steps.map((step, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <h3 className="font-semibold">Buổi {step.step_number}</h3>
            <ul className="list-disc list-inside">
              {step.service_ids.map((serviceId) => (
                <li key={serviceId}>{getServiceName(serviceId)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
