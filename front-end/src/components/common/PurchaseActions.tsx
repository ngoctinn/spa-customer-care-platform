// "use client";

// import { Button } from "@/components/ui/button";
// import { ShoppingCart, Bolt, CalendarCheck } from "lucide-react";
// import Link from "next/link";
// import { toast } from "sonner";
// import useCartStore from "@/stores/cart-store";
// import { useRouter } from "next/navigation";

// interface PurchaseActionsProps {
//   item: {
//     id: string;
//     name: string;
//     price: number;
//     imageUrl: string;
//     type: "product" | "service" | "treatment";
//   };
//   bookNowLink?: string;
//   disabled?: boolean;
// }

// export const PurchaseActions = ({
//   item,
//   bookNowLink,
//   disabled = false,
// }: PurchaseActionsProps) => {
//   const { addItem } = useCartStore();
//   const router = useRouter();

//   const handleAddToCart = () => {
//     addItem({ ...item, quantity: 1 });
//     toast.success(`${item.name} đã được thêm vào giỏ hàng!`);
//   };
//   const handleBuyNow = () => {
//     addItem({ ...item, quantity: 1 });
//     router.push("/checkout");
//   };

//   if (item.type === "service") {
//     return (
//       <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
//         <Button size="lg" asChild className="sm:col-span-2" disabled={disabled}>
//           <Link href={bookNowLink || `/booking?serviceId=${item.id}`}>
//             <CalendarCheck className="mr-2 h-5 w-5" />
//             Đặt lịch ngay
//           </Link>
//         </Button>
//         <Button
//           size="lg"
//           variant="outline"
//           onClick={handleAddToCart}
//           disabled={disabled}
//         >
//           <ShoppingCart className="mr-2 h-5 w-5" />
//           Thêm vào giỏ (Mua trước)
//         </Button>
//         <Button
//           size="lg"
//           variant="outline"
//           onClick={handleBuyNow}
//           disabled={disabled}
//         >
//           <Bolt className="mr-2 h-5 w-5" />
//           Mua ngay
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col sm:flex-row gap-4">
//       <Button
//         size="lg"
//         variant="outline"
//         onClick={handleAddToCart}
//         disabled={disabled}
//         className="flex-1"
//       >
//         <ShoppingCart className="mr-2 h-5 w-5" />
//         Thêm vào giỏ
//       </Button>
//       <Button
//         size="lg"
//         onClick={handleBuyNow}
//         disabled={disabled}
//         className="flex-1"
//       >
//         <Bolt className="mr-2 h-5 w-5" />
//         Mua ngay
//       </Button>
//     </div>
//   );
// };
