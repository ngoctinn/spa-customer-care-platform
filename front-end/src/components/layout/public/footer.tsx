import Link from "next/link";
import {
  Sparkles,
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột Logo và Giới thiệu */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <Sparkles className="text-foreground text-2xl mr-3" />
              <h1 className="text-xl text-foreground font-semibold">
                Serenity Spa
              </h1>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Nơi vẻ đẹp và sự thư giãn hội tụ.
            </p>
          </div>
          {/* Cột Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông Tin Liên Hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">
                  123 Đường ABC, Phường X, Quận Y, TP.HCM
                </span>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">0987.654.321</span>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">
                  contact@serenityspa.vn
                </span>
              </li>
            </ul>
          </div>

          {/* Cột Mạng xã hội */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Kết Nối Với Chúng Tôi
            </h3>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Youtube className="w-6 h-6" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Tìm Chúng Tôi</h3>
            <div className="rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447171129337!2d106.69747921535593!3d10.776983392322353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a3d2fbf4b%3A0x2f8b4b7a1f8b4b7a!2sDinh%20Th%E1%BB%91ng%20Nh%E1%BA%A5t!5e0!3m2!1svi!2s!4v1678886482813!5m2!1svi!2s"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Serenity Spa. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
