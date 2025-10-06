export const getErrorMessage = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi không xác định."
): string => {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallbackMessage;
};
