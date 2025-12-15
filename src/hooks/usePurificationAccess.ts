import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { checkPurificationAccess} from "@/lib/services/purification"

export function usePurificationAccess() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: checkPurificationAccess,
    onSuccess: (data) => {
      // Show success message
      toast.success(`تم استخدام محاولة بنجاح. متبقي: ${data.purificationCount} محاولات`)
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") {
        // User not logged in
        toast.error("يجب تسجيل الدخول لاستخدام حاسبة التطهير")
        router.push("/register")
      } else if (error.message === "لقد وصلت للحد الأقصى") {
        // No purification attempts remaining
        toast.error("لقد وصلت للحد الأقصى من محاولات التطهير")
        router.push("/pricing")
      
      } else {
        // Generic error
        toast.error(error.message || "حدث خطأ ما")
      }
    },
  })

  return {
    checkAccess: mutation.mutate,
    isLoading: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
  }
}
