// src/features/scheduling/apis/event.api.ts
import apiClient from "@/lib/apiClient";
import { Event } from "@/features/event-types/types";
import { EventFormValues } from "@/features/event-types/schemas/event.schema";

/**
 * Lấy danh sách tất cả sự kiện.
 */
export async function getEvents(): Promise<Event[]> {
  return apiClient<Event[]>("/events");
}

/**
 * Lấy thông tin chi tiết một sự kiện bằng ID.
 */
export async function getEventById(id: string): Promise<Event> {
  return apiClient<Event>(`/events/${id}`);
}

/**
 * Tạo một sự kiện mới.
 */
export async function createEvent(eventData: EventFormValues): Promise<Event> {
  return apiClient<Event>("/events", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

/**
 * Cập nhật một sự kiện.
 */
export async function updateEvent(
  id: string,
  eventData: Partial<EventFormValues>
): Promise<Event> {
  return apiClient<Event>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(eventData),
  });
}

/**
 * Xóa một sự kiện.
 */
export async function deleteEvent(id: string): Promise<void> {
  return apiClient<void>(`/events/${id}`, {
    method: "DELETE",
  });
}
