"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { usePurificationAccess } from "@/hooks/usePurificationAccess"
import { Card } from "@/components/ui/card"




export default function PurificationCalculator({ triggerLabel = "احسب نسبة تطهيرك الآن" , purificationPercentage,purificationValue }: { triggerLabel?: string, purificationPercentage: number , purificationValue: number}) {
  const [open, setOpen] = useState(false)
  const { checkAccess, isLoading, data, error, reset } = usePurificationAccess()

  const handleDialogOpen = (shouldOpen: boolean) => {
    if (shouldOpen) {
      // Check access before opening dialog
      checkAccess(undefined, {
        onSuccess: (data) => {
          // Only open dialog if access was granted
          setOpen(true)
        },
        onError: () => {
          // Error is handled by the hook, don't open dialog
          setOpen(false)
        }
      })
    } else {
      setOpen(false)
      // Reset mutation state when closing
      reset()
    }
  }

  const [shares, setShares] = useState<string | undefined>();
  const [days, setDays] = useState<string | undefined>();
  const [result, setResult] = useState<string | undefined>();

  const [profit, setProfit] = useState<string | undefined>()
  const [purificationAmount, setPurificationAmount] = useState<string | undefined>()
  const [result2, setResult2] = useState<string | undefined>()
  const handelPurification = () => {
    if (shares === undefined || days === undefined) return;
    const calculation = purificationValue * Number(shares) * Number(days);
    setResult(calculation.toString());
    
  };

  const handelPurification2 =()=>{
    if (profit === undefined) return;
    const calculation = (Number(profit) *(purificationPercentage/100));
    setResult2(calculation.toString());
  }
  return (
    <Dialog  open={open} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="px-6" disabled={isLoading}>
          {isLoading ? "جاري التحقق..." : triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>احسب نسبة تطهيرك</DialogTitle>
          {data?.purificationCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {data.purificationCount <= 1 && data.purificationCount > 0 
                ? `متبقي: محاولة واحدة` 
                : `متبقي: ${data.purificationCount} محاولات`
              }
            </p>
          )}
        </DialogHeader>

       <div className="flex flex-col items-center gap-4 justify-center">
        <h2 className="text-lg font-semibold mb-4">احسب نسبة تطهيرك</h2>
        
        <Card className="p-1 sm:p-4 w-full pb-4">
          <div className="w-full flex items-center justify-center">
          <p className="text-center text-sm max-w-sm text-gray-400">
             مبدا الايوفي وينصح بها في حالة الشراء بهدف الاستثمار والاحتفاظ (في الربح والخسارة)
          </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Input 
              placeholder="عدد الأسهم" 
              type="text" 
              value={shares}
              onChange={(e) => setShares(e.target.value)}
            />
            <Input 
              placeholder="عدد ايام الاحتفاظ" 
              type="text"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          {result !== undefined && <p className="text-center">{`مبلغ التطهير: ${Number(result).toFixed(2)} جنية`}</p>}
          <Button onClick={handelPurification} className="mt-4 w-full">احسب نسبة التطهير</Button>
        </Card>
       <Card className="p-1 sm:p-4 w-full pb-4">
          <div className="w-full flex items-center justify-center">
          <p className="text-center text-sm max-w-sm text-gray-400">
            مبدا s&b وينصح به في حالة الشراء بهدف الربح من فرق السعر والمضارب (في الربح فقط)
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
           
            <Input 
              placeholder="مقدار ربحك" 
              type="text"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
            />
          </div>
          {result2 !== undefined  && <p className="text-center">{`مبلغ التطهير: ${Number(result2).toFixed(2)} جنية`}</p>}
          <Button onClick={handelPurification2} className="mt-4 w-full">احسب نسبة التطهير</Button>
        </Card>
       </div>
      </DialogContent>
    </Dialog>
  )
}
