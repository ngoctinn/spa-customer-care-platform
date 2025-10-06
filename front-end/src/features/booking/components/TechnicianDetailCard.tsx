// src/features/booking/components/TechnicianDetailCard.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullStaffProfile } from "@/features/staff/types";
import { Star } from "lucide-react";

interface TechnicianDetailCardProps {
  technician: FullStaffProfile;
}

export function TechnicianDetailCard({
  technician,
}: TechnicianDetailCardProps) {
  const role = technician.roles?.[0]?.name || "Kỹ thuật viên";

  // Dữ liệu giả lập cho đánh giá và chuyên môn, bạn có thể thay thế bằng dữ liệu thật
  const rating = 4.5;
  const reviewCount = 120;
  const specializations = [
    "Chăm sóc da mặt",
    "Massage body",
    "Trị liệu chuyên sâu",
  ];

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-col items-center text-center p-4">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={technician.avatar_url} alt={technician.full_name} />
          <AvatarFallback>{technician.full_name[0]}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-xl">{technician.full_name}</CardTitle>
        <p className="text-sm text-primary">{role}</p>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <Star className="w-4 h-4 text-star fill-star" />
          <span className="font-semibold">{rating}</span>
          <span>({reviewCount} đánh giá)</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm">Chuyên môn</h4>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <Badge key={spec} variant="secondary">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm">Giới thiệu</h4>
            <p className="text-sm text-muted-foreground">
              Với hơn 5 năm kinh nghiệm trong ngành spa và thẩm mỹ,{" "}
              {technician.full_name} luôn tận tâm mang đến cho khách hàng những
              trải nghiệm thư giãn và hiệu quả nhất.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
