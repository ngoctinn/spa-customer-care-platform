// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { getServiceById } from "@/features/service/api/service.api";
// import { ReviewList } from "@/features/review/components/ReviewList";
// import { Clock, Tag } from "lucide-react";
// import { notFound } from "next/navigation";
// import { useState, useEffect } from "react";
// import { useReviews } from "@/features/review/hooks/useReviews";
// import { FullPageLoader } from "@/components/ui/spinner";
// import { DetailPageLayout } from "@/components/common/DetailPageLayout";
// import { PurchaseActions } from "@/features/shared/components/common/PurchaseActions";

// interface ServiceDetailPageProps {
//   params: { id: string };
// }

// export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
//   const { id } = params;
//   const [mainImage, setMainImage] = useState<string | null>(null);

//   const {
//     data: service,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["service", id],
//     queryFn: () => getServiceById(id),
//   });

//   const { data: allReviews = [], isLoading: isLoadingReviews } = useReviews();

//   useEffect(() => {
//     if (service?.imageUrl) {
//       setMainImage(service.imageUrl);
//     } else if (service?.imageUrls && service.imageUrls.length > 0) {
//       setMainImage(service.imageUrls[0]);
//     }
//   }, [service]);

//   if (isLoading || isLoadingReviews) {
//     return <FullPageLoader text="Đang tải dịch vụ..." />;
//   }

//   if (error || !service) {
//     notFound();
//   }

//   const serviceReviews = allReviews.filter(
//     (review) => review.serviceId === service.id
//   );

//   const thumbnailImages = [
//     service.imageUrl,
//     ...(service.imageUrls || []),
//   ].filter((url): url is string => !!url);

//   return (
//     <DetailPageLayout
//       mainImage={mainImage}
//       imageAlt={service.name}
//       thumbnailUrls={thumbnailImages}
//       onThumbnailClick={setMainImage}
//       title={<h1 className="text-4xl font-bold mb-4">{service.name}</h1>}
//       description={
//         <p className="text-muted-foreground">{service.description}</p>
//       }
//       details={
//         <>
//           <div className="flex items-center">
//             <Clock className="mr-2 h-5 w-5" />
//             <span>{service.duration} phút</span>
//           </div>
//           <div className="flex items-center">
//             <Tag className="mr-2 h-5 w-5" />
//             <span className="font-semibold">
//               {new Intl.NumberFormat("vi-VN").format(service.price)} VNĐ
//             </span>
//           </div>
//         </>
//       }
//       purchaseActions={
//         <PurchaseActions
//           item={{
//             id: service.id,
//             name: service.name,
//             price: service.price,
//             imageUrl: service.imageUrl,
//             type: "service",
//           }}
//           bookNowLink={`/booking?serviceId=${service.id}`}
//         />
//       }
//     >
//       <ReviewList reviews={serviceReviews} />
//     </DetailPageLayout>
//   );
// }
