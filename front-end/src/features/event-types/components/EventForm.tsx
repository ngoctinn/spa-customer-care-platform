// src/features/scheduling/components/EventForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventFormSchema,
  EventFormValues,
} from "@/features/event-types/schemas/event.schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useEventMutations } from "../hooks/useEvents";
import { Event } from "../types";

export function EventForm({ event }: { event?: Event }) {
  const router = useRouter();
  const { createMutation, updateMutation, deleteMutation } =
    useEventMutations();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ?? {
      name: "",
      description: "",
      isActive: true,
      durationInMinutes: 30,
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: EventFormValues) {
    if (event) {
      // Chế độ chỉnh sửa
      updateMutation.mutate(
        { id: event.id, data: values },
        {
          onSuccess: () => {
            router.push("/dashboard/event-types");
          },
        }
      );
    } else {
      // Chế độ tạo mới
      createMutation.mutate(values, {
        onSuccess: () => {
          router.push("/dashboard/event-types");
        },
      });
    }
  }

  const handleDelete = () => {
    if (event) {
      deleteMutation.mutate(event.id, {
        onSuccess: () => {
          router.push("/dashboard/event-types");
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên sự kiện</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Tên mà người dùng sẽ thấy khi đặt lịch.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="durationInMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời lượng</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                />
              </FormControl>
              <FormDescription>(Tính bằng phút)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea className="resize-none h-32" {...field} />
              </FormControl>
              <FormDescription>Mô tả tùy chọn về sự kiện.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Kích hoạt</FormLabel>
              </div>
              <FormDescription>
                Sự kiện không kích hoạt sẽ không thể được đặt lịch.
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-end">
          {event && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={isSubmitting || deleteMutation.isPending}
                  type="button"
                >
                  Xóa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isSubmitting || deleteMutation.isPending}
                    onClick={handleDelete}
                  >
                    {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            disabled={isSubmitting || deleteMutation.isPending}
            type="button"
            asChild
            variant="outline"
          >
            <Link href="/dashboard/event-types">Hủy</Link>
          </Button>
          <Button
            disabled={isSubmitting || deleteMutation.isPending}
            type="submit"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
