"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type FieldDef = {
  name: string
  label: string
  type?: "text" | "email" | "number" | "select" | "array"
  placeholder?: string
  options?: { label: string; value: string }[]
  itemType?: string
  itemPlaceholder?: string
}

export type CrudModalProps<T extends Record<string, any>> = {
  open: boolean
  setOpen: (v: boolean) => void
  title: string
  schema?: z.ZodType<T>
  fields: FieldDef[]
  defaultValues?: Partial<T>
  onSubmit: (values: T) => void
}

export default function CrudModal<T extends Record<string, any>>({ open, setOpen, title, schema, fields, defaultValues, onSubmit }: CrudModalProps<T>) {
  const form = useForm<any>({
    resolver: schema ? zodResolver(schema as any) : undefined,
    defaultValues: defaultValues || {},
    mode: "onTouched",
  })

  useEffect(() => {
    form.reset(defaultValues || {})
  }, [defaultValues])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir="rtl" className="sm:max-w-[560px] max-h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((vals) => { onSubmit(vals as T); setOpen(false) })} className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        {f.type === "select" ? (
                          <SelectBox value={field.value} onChange={field.onChange} options={f.options || []} placeholder={f.placeholder || "اختر"} />
                        ) : f.type === "array" ? (
                          <div className="w-full space-y-2">
                            {(field.value || []).map((item: string, index: number) => (
                              <div key={index} className="w-full flex gap-2">
                                <Input
                                
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newItems = [...field.value];
                                    newItems[index] = e.target.value;
                                    field.onChange(newItems);
                                  }}
                                  placeholder={f.itemPlaceholder || f.placeholder}
                                  className="flex-1 sm:w-[400px]"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newItems = field.value.filter((_: any, i: number) => i !== index);
                                    field.onChange(newItems);
                                  }}
                                >
                                  حذف
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                field.onChange([...(field.value || []), ""]);
                              }}
                            >
                              + إضافة عنصر
                            </Button>
                          </div>
                        ) : (
                          <Input  type={f.type || "text"} placeholder={f.placeholder} {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button type="submit">حفظ</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function SelectBox({ value, onChange, options, placeholder }: { value?: string; onChange: (v: string) => void; options: { label: string; value: string }[]; placeholder: string }) {
  const openVal = false
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className={cn(!value && "text-muted-foreground")}>{options.find((o) => o.value === value)?.label || placeholder}</span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-[220px]">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>لا يوجد نتائج</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem key={opt.value} value={opt.label} onSelect={() => onChange(opt.value)} className="cursor-pointer">
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
