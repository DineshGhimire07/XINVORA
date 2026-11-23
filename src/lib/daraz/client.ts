import crypto from "crypto"

export interface DarazConfig {
  appKey: string
  appSecret: string
  apiUrl: string // Default: "https://api.daraz.com.np/rest"
  callbackUrl: string // Exactly: "https://xinvora.com.np/daraz/callback"
}

export interface DarazTokenResponse {
  code?: string
  message?: string
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  account?: string
  account_platform?: string
  country?: string
  country_user_info?: Array<{
    country: string
    seller_id: string
    user_id: number | string
  }>
}

export interface DarazCategoryNode {
  category_id: number | string
  name: string
  leaf: boolean
  children?: DarazCategoryNode[]
}

export interface DarazCategoryTreeResponse {
  code: string
  message: string
  request_id?: string
  data: DarazCategoryNode[]
}

export interface DarazAttributeItem {
  id: number | string
  name: string
  input_type: string // "text", "richText", "singleSelect", "multiSelect", etc.
  is_mandatory: number // 1 or 0
  attribute_type: string // "normal", "sku"
  options?: Array<{ name: string; en_name?: string; id?: string }>
  label?: string
}

export interface DarazCategoryAttributesResponse {
  code: string
  message: string
  request_id?: string
  data: DarazAttributeItem[]
}

/**
 * Daraz Open Platform (Nepal) API Client
 *
 * Implements official Alibaba/Lazada Open Platform OpenAPI specifications:
 * - HMAC-SHA256 signature algorithm
 * - Standard millisecond epoch timestamp format
 * - Code-for-Token exchange & token refresh
 * - Category tree and dynamic category attributes retrieval
 */
export class DarazClient {
  private config: DarazConfig

  constructor(config?: Partial<DarazConfig>) {
    this.config = {
      appKey: config?.appKey || process.env.DARAZ_APP_KEY || "",
      appSecret: config?.appSecret || process.env.DARAZ_APP_SECRET || "",
      apiUrl: config?.apiUrl || process.env.DARAZ_API_URL || "https://api.daraz.com.np/rest",
      callbackUrl: config?.callbackUrl || process.env.DARAZ_CALLBACK_URL || "https://xinvora.com.np/daraz/callback",
    }
  }

  /**
   * Generates the HMAC-SHA256 signature according to the official Daraz Open Platform documentation:
   * 1. Collect all parameters (excluding 'sign').
   * 2. Sort parameter keys alphabetically in ASCII order.
   * 3. Concatenate: apiPath + key1 + value1 + key2 + value2...
   * 4. Compute HMAC-SHA256 using appSecret as key.
   * 5. Return uppercase hexadecimal string.
   */
  public generateSignature(apiPath: string, params: Record<string, string | number | boolean>): string {
    const sortedKeys = Object.keys(params)
      .filter((key) => key !== "sign" && params[key] !== undefined && params[key] !== null)
      .sort()

    let baseString = apiPath
    for (const key of sortedKeys) {
      baseString += `${key}${params[key]}`
    }

    return crypto
      .createHmac("sha256", this.config.appSecret)
      .update(baseString, "utf8")
      .digest("hex")
      .toUpperCase()
  }

  /**
   * Builds the official Daraz OAuth Seller Authorization URL for Nepal:
   * https://api.daraz.com.np/oauth/authorize?response_type=code&force_auth=true&redirect_uri=...&client_id=...&state=...
   */
  public getAuthorizationUrl(state: string): string {
    if (!this.config.appKey) {
      throw new Error("DARAZ_APP_KEY is not configured.")
    }
    const params = new URLSearchParams({
      response_type: "code",
      force_auth: "true",
      redirect_uri: this.config.callbackUrl,
      client_id: this.config.appKey,
      state: state,
    })

    return `https://api.daraz.com.np/oauth/authorize?${params.toString()}`
  }

  /**
   * Executes a signed API call to Daraz REST Gateway.
   */
  public async execute<T = any>(
    apiPath: string,
    params: Record<string, any> = {},
    options: { accessToken?: string; method?: "GET" | "POST" } = {}
  ): Promise<T> {
    const { appKey, appSecret, apiUrl } = this.config
    if (!appKey || !appSecret) {
      throw new Error("Daraz credentials missing: DARAZ_APP_KEY and DARAZ_APP_SECRET must be set.")
    }

    const method = options.method || "GET"
    const timestamp = Date.now().toString()

    const requestParams: Record<string, any> = {
      app_key: appKey,
      timestamp,
      sign_method: "sha256",
      ...params,
    }

    if (options.accessToken) {
      requestParams.access_token = options.accessToken
    }

    // Generate official signature
    const sign = this.generateSignature(apiPath, requestParams)
    requestParams.sign = sign

    const endpointUrl = `${apiUrl.replace(/\/+$/, "")}${apiPath}`

    let response: Response
    const startTime = Date.now()

    if (method === "GET") {
      const query = new URLSearchParams()
      for (const [key, value] of Object.entries(requestParams)) {
        query.append(key, String(value))
      }
      response = await fetch(`${endpointUrl}?${query.toString()}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "XINVORA-Listing-Studio/1.0",
        },
        cache: "no-store",
      })
    } else {
      // POST requests in Daraz OpenAPI use application/x-www-form-urlencoded
      const formBody = new URLSearchParams()
      for (const [key, value] of Object.entries(requestParams)) {
        formBody.append(key, String(value))
      }
      response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          "Accept": "application/json",
          "User-Agent": "XINVORA-Listing-Studio/1.0",
        },
        body: formBody.toString(),
        cache: "no-store",
      })
    }

    const durationMs = Date.now() - startTime
    const responseText = await response.text()

    let json: any
    try {
      json = JSON.parse(responseText)
    } catch {
      throw new Error(`Daraz API returned invalid JSON (HTTP ${response.status}): ${responseText.slice(0, 300)}`)
    }

    // Check for Daraz error format (code !== "0")
    if (json.code && json.code !== "0") {
      const errMsg = json.message || json.sub_message || `Daraz API Error Code ${json.code}`
      const error: any = new Error(errMsg)
      error.code = json.code
      error.requestId = json.request_id
      error.raw = json
      throw error
    }

    return json as T
  }

  /**
   * Exchanges authorization code for Access & Refresh tokens (/auth/token/create)
   */
  public async createToken(code: string): Promise<DarazTokenResponse> {
    return this.execute<DarazTokenResponse>(
      "/auth/token/create",
      { code },
      { method: "POST" }
    )
  }

  /**
   * Refreshes an expired Access Token (/auth/token/refresh)
   */
  public async refreshToken(refreshToken: string): Promise<DarazTokenResponse> {
    return this.execute<DarazTokenResponse>(
      "/auth/token/refresh",
      { refresh_token: refreshToken },
      { method: "POST" }
    )
  }

  /**
   * Retrieves the full category hierarchy tree (/category/tree/get)
   */
  public async getCategoryTree(accessToken?: string): Promise<DarazCategoryTreeResponse> {
    return this.execute<DarazCategoryTreeResponse>(
      "/category/tree/get",
      { language_code: "en_US" },
      { accessToken, method: "GET" }
    )
  }

  /**
   * Retrieves category attributes schema for a specific leaf category (/category/attributes/get)
   */
  public async getCategoryAttributes(
    primaryCategoryId: string | number,
    accessToken?: string
  ): Promise<DarazCategoryAttributesResponse> {
    return this.execute<DarazCategoryAttributesResponse>(
      "/category/attributes/get",
      {
        primary_category_id: String(primaryCategoryId),
        language_code: "en_US",
      },
      { accessToken, method: "GET" }
    )
  }
}
