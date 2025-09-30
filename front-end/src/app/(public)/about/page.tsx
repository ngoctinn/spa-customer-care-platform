// src/app/(public)/about/page.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, Users, Handshake } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

// Tối ưu SEO cho trang
export const metadata: Metadata = {
  title: "Giới Thiệu - Serenity Spa",
  description:
    "Tìm hiểu về câu chuyện, sứ mệnh và đội ngũ chuyên gia tận tâm tại Serenity Spa. Khám phá lý do chúng tôi là điểm đến tin cậy cho sự thư giãn và sắc đẹp của bạn.",
};

// Dữ liệu giả lập cho đội ngũ, bạn có thể thay thế bằng API sau này
const teamMembers = [
  {
    name: "Nguyễn Thị An",
    role: "Chuyên gia Chăm sóc da",
    avatarUrl: "/images/team/member-1.jpg",
    fallback: "AN",
  },
  {
    name: "Trần Văn Bình",
    role: "Chuyên viên Massage trị liệu",
    avatarUrl: "/images/team/member-2.jpg",
    fallback: "TB",
  },
  {
    name: "Lê Ngọc Châu",
    role: "Quản lý Spa",
    avatarUrl: "/images/team/member-3.jpg",
    fallback: "LC",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <header className="text-center mb-16">
        <div className="inline-block bg-primary/10 text-primary p-3 rounded-full mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Về Serenity Spa
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
          Nơi vẻ đẹp và sự thư giãn hội tụ, mang đến cho bạn những trải nghiệm
          chăm sóc đẳng cấp và tinh tế nhất.
        </p>
      </header>

      {/* Story & Mission Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/images/spa-interior.jpg" // Thay thế bằng ảnh spa của bạn
            alt="Không gian Serenity Spa"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-primary mt-1">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Sứ Mệnh Của Chúng Tôi</h2>
              <p className="text-muted-foreground mt-2">
                Tại Serenity Spa, chúng tôi tin rằng mỗi người đều xứng đáng có
                những phút giây thư giãn trọn vẹn để tái tạo năng lượng và nuôi
                dưỡng vẻ đẹp từ bên trong. Sứ mệnh của chúng tôi là tạo ra một
                ốc đảo bình yên, nơi bạn có thể gác lại mọi lo toan và tận hưởng
                những liệu pháp chăm sóc hiệu quả nhất.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-primary mt-1">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Cam Kết Chất Lượng</h2>
              <p className="text-muted-foreground mt-2">
                Chúng tôi cam kết sử dụng những sản phẩm cao cấp, an toàn cùng
                công nghệ hiện đại nhất. Mỗi liệu trình đều được thiết kế riêng
                để phù hợp với nhu cầu và tình trạng của từng khách hàng, đảm
                bảo mang lại hiệu quả vượt trội.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center">
        <div className="inline-block bg-primary/10 text-primary p-3 rounded-full mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">
          Gặp Gỡ Đội Ngũ Chuyên Gia
        </h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Với sự tận tâm và tay nghề cao, đội ngũ của chúng tôi luôn sẵn sàng
          mang đến cho bạn sự hài lòng tuyệt đối.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <Card
              key={member.name}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>{member.fallback}</AvatarFallback>
                </Avatar>
                <CardTitle>{member.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-medium">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
