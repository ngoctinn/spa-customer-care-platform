// components/TreatmentSteps.tsx
"use client";

import { TreatmentPlan } from "@/features/treatment/types";
import { Service } from "@/features/service/types";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useMemo } from "react";

interface TreatmentStepsProps {
  plan: TreatmentPlan;
  allServices: Service[];
}

export default function TreatmentSteps({
  plan,
  allServices,
}: TreatmentStepsProps) {
  const servicesMap = useMemo(() => {
    const map = new Map<string, Service>();
    allServices.forEach((service) => {
      map.set(service.id, service);
    });
    return map;
  }, [allServices]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quy trình</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-border after:left-0">
          {/* highlight-start */}
          {plan.steps.map((step) => {
            const service = servicesMap.get(step.service_id);

            return (
              <div
                key={step.step_number}
                className="grid grid-cols-[auto_1fr] gap-x-6 items-start mb-8"
              >
                <div className="flex items-center justify-center -ml-1">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg ring-8 ring-background">
                    {step.step_number}
                  </div>
                </div>
                <div className="pt-1.5">
                  <h3 className="text-xl font-semibold">
                    Buổi {step.step_number}
                  </h3>
                  <div className="mt-2 space-y-3">
                    {service ? (
                      <Link
                        key={service.id}
                        href={`/services/${service.id}`}
                        passHref
                      >
                        <div className="p-3 bg-card rounded-md border flex items-center cursor-pointer hover:bg-muted/50 transition-colors">
                          <CheckCircle className="w-4 h-4 mr-3 text-accent" />
                          <span>
                            {service.name} ({service.duration_minutes} phút)
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <p className="text-muted-foreground">
                        Chưa có dịch vụ cho buổi này.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {/* highlight-end */}
        </div>
      </CardContent>
    </Card>
  );
}
