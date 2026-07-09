export const PREVIEW_CONFIG = {
  // Toggle this true/false to enable or disable the pre-launch preview mode globally.
  // Can also be controlled via NEXT_PUBLIC_PREVIEW_MODE env variable.
  enabled: process.env.NEXT_PUBLIC_PREVIEW_MODE !== "false", 
  
  accessKey: "79137913",
  cookieName: "xinvora_preview_access",
  cookieMaxAge: 60 * 60 * 24 * 30, // 30 days in seconds
}
