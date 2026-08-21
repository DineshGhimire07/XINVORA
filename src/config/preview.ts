export const PREVIEW_CONFIG = {
  // Website is LIVE by default. Set NEXT_PUBLIC_PREVIEW_MODE=true to re-enable lock screen.
  enabled: process.env.NEXT_PUBLIC_PREVIEW_MODE === "true", 
  
  accessKey: "79137913",
  cookieName: "xinvora_preview_access",
  cookieMaxAge: 60 * 60 * 24 * 30, // 30 days in seconds
}
