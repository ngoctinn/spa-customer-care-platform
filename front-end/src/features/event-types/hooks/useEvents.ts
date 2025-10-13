// src/features/scheduling/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/features/event-types/api/event.api";
import { Event } from "@/features/event-types/types";
import { EventFormValues } from "../schemas/event.schema";

const queryKey = ["events"];

/**
 * Hook để lấy danh sách sự kiện.
 */
export const useEvents = () => {
  return useQuery<Event[]>({
    queryKey,
    queryFn: getEvents,
  });
};

/**
 * Hook để lấy chi tiết một sự kiện bằng ID.
 */
export const useEventById = (eventId: string) => {
  return useQuery<Event>({
    queryKey: [...queryKey, eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId,
  });
};

/**
 * Hook chứa các mutations (create, update, delete) cho sự kiện.
 */
export const useEventMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      toast.success("Tạo sự kiện thành công!");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error("Tạo sự kiện thất bại", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EventFormValues>;
    }) => updateEvent(id, data),
    onSuccess: () => {
      toast.success("Cập nhật sự kiện thành công!");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error("Cập nhật thất bại", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success("Đã xóa sự kiện!");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error("Xóa sự kiện thất bại", { description: error.message });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
