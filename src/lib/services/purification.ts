export interface PurificationAccessResponse {
  success: boolean
  purificationCount: number
}

export async function checkPurificationAccess(): Promise<PurificationAccessResponse> {
  try {
    const response = await fetch("/api/purification/access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      redirect: "manual", // Don't follow redirects automatically
    })

    // Check for redirect (middleware redirecting to login)
    if (response.type === "opaqueredirect" || response.status === 0) {
      throw new Error("UNAUTHORIZED")
    }

    // Check if redirected (3xx status)
    if (response.status >= 300 && response.status < 400) {
      throw new Error("UNAUTHORIZED")
    }

    // Check if response is HTML (redirect to login page)
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("text/html")) {
      throw new Error("UNAUTHORIZED")
    }

    // Check for 401 before trying to parse JSON
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED")
    }

    const result = await response.json()

    if (!response.ok) {
      // Handle different error cases
      if (response.status === 402) {
        throw new Error(result.message || "NO_ATTEMPTS")
      } else {
        throw new Error(result.message || "API_ERROR")
      }
    }

    return result as PurificationAccessResponse
  } catch (error) {
    // Re-throw known errors
    if (error instanceof Error && 
        (error.message === "UNAUTHORIZED" || 
         error.message === "لقد وصلت للحد الأقصى" || 
         error.message === "API_ERROR")) {
      throw error
    }
    
    // Handle network errors or JSON parsing errors
    console.error("Purification access error:", error)
    throw new Error("NETWORK_ERROR")
  }
}
