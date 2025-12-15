import type { CreateStockInput, UpdateStockInput } from "@/lib/validations/stock"

export async function fetchAdminStocks(): Promise<(UpdateStockInput & { id: string; updatedAt: Date })[]> {
  const res = await fetch("/api/stocks", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("فشل في تحميل الأسهم")
  }
  const data = await res.json()
  return (data.stocks || []) as (UpdateStockInput & { id: string; updatedAt: Date })[]
}

export async function createAdminStock(input: CreateStockInput): Promise<UpdateStockInput & { id: string; updatedAt: Date }> {
  const res = await fetch("/api/stocks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error || "فشل في إنشاء السهم"
    throw new Error(msg)
  }

  const data = await res.json()
  return data.stock as UpdateStockInput & { id: string; updatedAt: Date }
}

export async function updateAdminStock(
  id: string, 
  input: UpdateStockInput,
  currentData?: UpdateStockInput
): Promise<UpdateStockInput & { id: string; updatedAt: Date }> {
  // Only include fields that have changed
  const changes: Record<string, any> = {};
  
  if (currentData) {
    (Object.keys(input) as Array<keyof UpdateStockInput>).forEach(key => {
      const inputValue = input[key];
      const currentValue = currentData[key];
      
      // Handle different types of values
      if (typeof inputValue === 'object' || typeof currentValue === 'object') {
        if (JSON.stringify(inputValue) !== JSON.stringify(currentValue)) {
          changes[key as string] = inputValue;
        }
      } else if (inputValue !== currentValue) {
        changes[key as string] = inputValue;
      }
    });
  } else {
    // If we don't have current data, send all fields
    Object.assign(changes, input);
  }

  // If no changes, throw an error
  if (Object.keys(changes).length === 0) {
    throw new Error('لا توجد تغييرات لحفظها');
  }

  const res = await fetch(`/api/stocks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error || "فشل في تحديث السهم";
    throw new Error(msg);
  }

  const data = await res.json();
  return data.stock as UpdateStockInput & { id: string; updatedAt: Date };
}

export async function deleteAdminStock(id: string): Promise<void> {
  const res = await fetch(`/api/stocks/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error || "فشل في حذف السهم"
    throw new Error(msg)
  }
}

export async function toggleAdminStockActive(
  id: string, 
  active: boolean, 
  currentData?: UpdateStockInput
): Promise<UpdateStockInput & { id: string; updatedAt: Date }> {
  // Only update if the active state is different
  if (currentData && currentData.active === active) {
    throw new Error('حالة السهم لم تتغير');
  }
  return updateAdminStock(id, { active } as any, currentData);
}

export async function getStockBy(id:string) {
  const res = await fetch(`/api/stocks/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error || "فشل في تحميل السهم";
    throw new Error(msg);
  }

  const data = await res.json();
  return data.stock as UpdateStockInput & { id: string; updatedAt: Date };
}
