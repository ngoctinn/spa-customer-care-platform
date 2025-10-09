// src/features/scheduling/components/EventForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventFormSchema,
  EventFormValues,
} from "@/features/scheduling/schemas/event.schema";
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
import { useTransition } from "react";

export function EventForm({
  event,
}: {
  event?: {
    id: string;
    name: string;
    description?: string;
    durationInMinutes: number;
    isActive: boolean;
  };
}) {
  const [isDeletePending, startDeleteTransition] = useTransition();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    // Giá trị mặc định `isActive: true` được cung cấp ở đây là hoàn toàn chính xác
    defaultValues: event ?? {
      name: "",
      description: "",
      isActive: true,
      durationInMinutes: 30,
    },
  });

  async function onSubmit(values: EventFormValues) {
    console.log("Form Submitted:", values);
    alert(
      "Form đã được gửi đi (chế độ front-end)! Vui lòng kiểm tra console log."
    );
  }

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
                  disabled={isDeletePending || form.formState.isSubmitting}
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
                    disabled={isDeletePending || form.formState.isSubmitting}
                    onClick={() => {
                      startDeleteTransition(() => {
                        console.log("Yêu cầu xóa event ID:", event.id);
                        alert("Đã yêu cầu xóa (chế độ front-end)!");
                      });
                    }}
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            disabled={isDeletePending || form.formState.isSubmitting}
            type="button"
            asChild
            variant="outline"
          >
            <Link href="/dashboard/event-types">Hủy</Link>
          </Button>
          <Button
            disabled={isDeletePending || form.formState.isSubmitting}
            type="submit"
          >
            Lưu
          </Button>
        </div>
      </form>
    </Form>
  );
}
