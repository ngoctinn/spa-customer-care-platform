// src/hooks/useCrudMutations.ts
import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useCallback } from "react";

// Định nghĩa các kiểu dữ liệu cho hàm
type AddFunc<TData, TVariables> = (variables: TVariables) => Promise<TData>;
type UpdateFunc<TData, TVariables> = (variables: {
  id: string;
  data: TVariables;
}) => Promise<TData>;
type DeleteFunc<TData> = (id: string) => Promise<TData>;

// Định nghĩa các thông báo tùy chỉnh
interface CustomMessages {
  addSuccess?: string;
  addError?: string;
  updateSuccess?: string;
  updateError?: string;
  deleteSuccess?: string;
  deleteError?: string;
}

/**
 * Một custom hook để trừu tượng hóa logic mutations cho các hoạt động CRUD,
 * đồng thời quản lý state cho dialog form và dialog xác nhận xóa.
 * @param queryKey - Key của query trong React Query để invalidate.
 * @param addFn - Hàm để thực hiện việc thêm mới.
 * @param updateFn - Hàm để thực hiện việc cập nhật.
 * @param deleteFn - Hàm để thực hiện việc xóa.
 * @param customMessages - (Tùy chọn) Các thông báo tùy chỉnh.
 */
export function useCrudMutations<
  TItem extends { id: string }, // Thêm ràng buộc TItem phải có id
  TAddVariables = any,
  TUpdateVariables = any
>(
  queryKey: QueryKey,
  addFn: AddFunc<TItem, TAddVariables>,
  updateFn: UpdateFunc<TItem, TUpdateVariables>,
  deleteFn: DeleteFunc<void>,
  customMessages: CustomMessages = {}
) {
  const queryClient = useQueryClient();

  // --- NEW: Quản lý State ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TItem | null>(null);

  // --- NEW: Các hàm xử lý (Handlers) ---
  const handleOpenAddForm = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((item: TItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  const handleOpenDeleteDialog = useCallback((item: TItem) => {
    setItemToDelete(item);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setItemToDelete(null);
  }, []);

  const messages = {
    addSuccess: customMessages.addSuccess || "Thêm mới thành công!",
    addError: customMessages.addError || "Thêm mới thất bại",
    updateSuccess: customMessages.updateSuccess || "Cập nhật thành công!",
    updateError: customMessages.updateError || "Cập nhật thất bại",
    deleteSuccess: customMessages.deleteSuccess || "Xóa thành công!",
    deleteError: customMessages.deleteError || "Xóa thất bại",
  };

  const addMutation = useMutation<TItem, Error, TAddVariables>({
    mutationFn: addFn,
    onSuccess: () => {
      toast.success(messages.addSuccess);
      queryClient.invalidateQueries({ queryKey });
      handleCloseForm(); // Tự động đóng form sau khi thành công
    },
    onError: (error) => {
      toast.error(messages.addError, { description: error.message });
    },
  });

  const updateMutation = useMutation<
    TItem,
    Error,
    { id: string; data: TUpdateVariables }
  >({
    mutationFn: updateFn,
    onSuccess: () => {
      toast.success(messages.updateSuccess);
      queryClient.invalidateQueries({ queryKey });
      handleCloseForm(); // Tự động đóng form sau khi thành công
    },
    onError: (error) => {
      toast.error(messages.updateError, { description: error.message });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteFn,
    onSuccess: () => {
      toast.success(messages.deleteSuccess);
      queryClient.invalidateQueries({ queryKey });
      handleCloseDeleteDialog(); // Tự động đóng dialog sau khi thành công
    },
    onError: (error) => {
      toast.error(messages.deleteError, { description: error.message });
    },
  });

  // Xử lý xác nhận xóa
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  return {
    addMutation,
    updateMutation,
    deleteMutation,
    // Trả về các state và hàm xử lý mới
    isFormOpen,
    editingItem,
    itemToDelete,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
}
