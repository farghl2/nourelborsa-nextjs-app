"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import FadeInUP from "@/animations/FadeInUP"
import { sendMessageToBo } from "@/actions/sendMessageToTelegramBot.action"
import { toast } from "sonner"


const schema = z.object({
  name: z.string().min(2, "الاسم يجب ان يحتوي على 2 احرف"),
  phone: z.string().min(10, "الهاتف يجب ان يحتوي على 10 رقم"),
  subject: z.string().min(2, "الموضوع يجب ان يحتوي على 2 احرف"),
  message: z.string().min(10, "الرساله يجب ان يحتوي على 10 حرف"),
})

export default function Page() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      subject: "",
      message: "",
    },
    mode: "onTouched",
  })

  async function onSubmit(values: z.infer<typeof schema>) {
   const res = await sendMessageToBo(JSON.stringify(values))
   if(res.success){
    toast.success("تم ارسال الرساله بنجاح");
    form.reset()
   }
  }

  return (
    <FadeInUP>
      <div dir="rtl" className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">تواصل معنا</h1>
      <p className="text-muted-foreground mt-2">نحن سعداء بمساعدتك في أي استفسارات أو استفسارات تتعلق بخدماتنا. يرجى إرسال رسالتك وسنتواصل معك في أقرب وقت ممكن.</p>

      <div className="mt-8 rounded-lg border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="الاسم" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الهاتف</FormLabel>
                  <FormControl>
                    <Input type="phone" placeholder="0123456789" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموضوع</FormLabel>
                  <FormControl>
                    <Input placeholder="الموضوع" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الرساله</FormLabel>
                  <FormControl>
                    <Textarea rows={6} placeholder="الرساله" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "ارسال..." : "ارسال"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
    </FadeInUP>
  )
}
