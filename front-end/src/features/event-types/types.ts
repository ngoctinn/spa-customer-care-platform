export interface Event {
  id: string;
  name: string;
  description?: string;
  durationInMinutes: number;
  isActive: boolean;
  clerkUserId: string;
}
