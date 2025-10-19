import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useCallback } from "react";

// --- CẬP NHẬT CÁC ĐỊNH NGHĨA HÀM ---
type AddFunc<TVariables> = (variables: TVariables) => Promise<any>;
type UpdateFunc<TVariables> = (variables: {
  id: string;
  data: TVariables;
}) => Promise<any>;
type DeleteFunc = (id: string) => Promise<void>;

interface CustomMessages {
  addSuccess?: string;
  addError?: string;
  updateSuccess?: string;
  updateError?: string;
  deleteSuccess?: string;
  deleteError?: string;
}

export function useCrudMutations<
  TItem extends { id: string },
  TAddVariables = any,
  TUpdateVariables = any
>(
  queryKey: QueryKey,
  addFn: AddFunc<TAddVariables>,
  updateFn: UpdateFunc<TUpdateVariables>,
  deleteFn: DeleteFunc,
  customMessages: CustomMessages = {}
) {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TItem | null>(null);

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

  const addMutation = useMutation<any, Error, TAddVariables>({
    mutationFn: addFn,
    onSuccess: () => {
      toast.success(messages.addSuccess);
      queryClient.invalidateQueries({ queryKey });
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(messages.addError, { description: error.message });
    },
  });

  const updateMutation = useMutation<
    any,
    Error,
    { id: string; data: TUpdateVariables }
  >({
    mutationFn: updateFn,
    onSuccess: () => {
      toast.success(messages.updateSuccess);
      queryClient.invalidateQueries({ queryKey });
      handleCloseForm();
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
      handleCloseDeleteDialog();
    },
    onError: (error) => {
      toast.error(messages.deleteError, { description: error.message });
    },
  });

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  return {
    addMutation,
    updateMutation,
    deleteMutation,
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
