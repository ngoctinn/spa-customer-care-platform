import { useQuery } from "@tanstack/react-query";
import { getRoles } from "@/features/user/apis/role.api";
import { Role } from "@/features/user/types";

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
  });
};
