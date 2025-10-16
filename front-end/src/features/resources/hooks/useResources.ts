// src/features/resources/hooks/useResources.ts
import { useQuery } from "@tanstack/react-query";
import { getRooms } from "../apis/room.api";
import { getBeds } from "../apis/bed.api";
import { getEquipments } from "../apis/equipment.api";

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });
};

export const useBeds = () => {
  return useQuery({
    queryKey: ["beds"],
    queryFn: getBeds,
  });
};

export const useEquipments = () => {
  return useQuery({
    queryKey: ["equipments"],
    queryFn: getEquipments,
  });
};
