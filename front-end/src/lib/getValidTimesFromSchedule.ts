// src/lib/getValidTimesFromSchedule.ts

// Hàm này bây giờ là một hàm giả lập, không gọi đến back-end.
// Nó trả về một số khung giờ giả định để front-end có thể hiển thị.
export async function getValidTimesFromSchedule(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number }
): Promise<Date[]> {
  console.log("Mocking getValidTimesFromSchedule for user:", event.clerkUserId);

  // Trả về 3 khung giờ giả lập: 9:00, 10:00, 14:00 của ngày hôm nay
  const today = new Date();
  const mockTimes = [
    new Date(today.setHours(9, 0, 0, 0)),
    new Date(today.setHours(10, 0, 0, 0)),
    new Date(today.setHours(14, 0, 0, 0)),
  ];

  return Promise.resolve(mockTimes);
}
