"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarPlus, CheckCircle } from "lucide-react";
import Link from "next/link";

interface PurchasedItemBannerProps {
  type: "service" | "treatment";
  remainingInfo: string;
  progressValue?: number; // From 0 to 100
  actionHref: string;
  actionText: string;
}

export default function PurchasedItemBanner({
  type,
  remainingInfo,
  progressValue,
  actionHref,
  actionText,
}: PurchasedItemBannerProps) {
  return (
    <Card className="mb-8 bg-primary/5 border-primary/40 shadow-md">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CheckCircle className="h-8 w-8 text-primary flex-shrink-0" />
          <div className="flex-grow">
            <h3 className="font-semibold text-primary">
              Bạn đã sở hữu {type === "service" ? "dịch vụ" : "liệu trình"} này!
            </h3>
            <p className="text-sm text-muted-foreground">{remainingInfo}</p>
            {progressValue !== undefined && (
              <Progress value={progressValue} className="w-full mt-2 h-2" />
            )}
          </div>
        </div>
        <Button asChild className="w-full sm:w-auto flex-shrink-0">
          <Link href={actionHref}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            {actionText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
