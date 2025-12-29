"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type FieldDef = {
  name: string
  label: string
  type?: "text" | "email" | "number" | "select" | "array" | "switch" | "multiselect" | "textarea"
  placeholder?: string
  options?: { label: string; value: string }[]
  itemType?: string
  itemPlaceholder?: string
  fullWidth?: boolean  // Makes field span full width (2 columns)
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
                    <FormItem className={f.fullWidth || f.type === "array" || f.type === "textarea" ? "sm:col-span-2" : ""}>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        {f.type === "select" ? (
                          <SelectBox value={field.value} onChange={field.onChange} options={f.options || []} placeholder={f.placeholder || "اختر"} />
                        ) : f.type === "switch" ? (
                          <div className="flex items-center gap-2">
                            <Switch 
                              dir="ltr" 
                              checked={field.value === true || field.value === "true"} 
                              onCheckedChange={(checked) => field.onChange(checked)}
                            />
                          </div>
                        ) : f.type === "array" ? (
                          <div className="w-full space-y-2 p-3 bg-background  rounded-lg border">
                            {(field.value || []).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-2">لا توجد عناصر بعد</p>
                            )}
                            {(field.value || []).map((item: string, index: number) => (
                              <div key={index} className="flex gap-2 items-center">
                                <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                                <Input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newItems = [...field.value];
                                    newItems[index] = e.target.value;
                                    field.onChange(newItems);
                                  }}
                                  placeholder={f.itemPlaceholder || f.placeholder}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                              className="w-full mt-2"
                              onClick={() => {
                                field.onChange([...(field.value || []), ""]);
                              }}
                            >
                              + إضافة عنصر
                            </Button>
                          </div>
                        ) : f.type === "textarea" ? (
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={f.placeholder}
                            {...field}
                          />
                        ) : (
                          <Input  
                            type={f.type || "text"} 
                            step={f.type === "number" ? "any" : undefined}
                            placeholder={f.placeholder} 
                            {...field} 
                          />
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
