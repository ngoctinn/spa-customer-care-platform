import { ImageUrl } from "@/features/shared/types";

export function appendFormDataValue(
  formData: FormData,
  key: string,
  value: string | number | boolean | Blob | null | undefined
) {
  if (value === undefined || value === null) {
    return;
  }

  if (value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  formData.append(key, String(value));
}

export function appendFormDataList(
  formData: FormData,
  key: string,
  values: Array<string | number | boolean | Blob>
) {
  values.forEach((value) => {
    appendFormDataValue(formData, key, value);
  });
}

export function splitImages(
  images: (File | ImageUrl)[] | undefined
): { files: File[]; existingIds: string[] } {
  const result = {
    files: [] as File[],
    existingIds: [] as string[],
  };

  if (!images) {
    return result;
  }

  images.forEach((image) => {
    if (image instanceof File) {
      result.files.push(image);
    } else if (image?.id) {
      result.existingIds.push(image.id);
    }
  });

  return result;
}
