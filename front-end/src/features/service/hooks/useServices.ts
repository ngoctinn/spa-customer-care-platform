import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/features/service/api/service.api";
import { Service } from "@/features/service/types";

export const useServices = () => {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: getServices,
  });
};
