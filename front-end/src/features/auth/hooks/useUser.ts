// src/features/auth/hooks/useUser.ts
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/features/auth/apis/auth_api";
import { User } from "@/features/user/types";

export const useUser = () => {
  return useQuery<User, Error>({
    queryKey: ["user-profile"],
    queryFn: fetchProfile,
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
  });
};
