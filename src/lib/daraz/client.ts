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

  /**
   * Uploads an image binary file to Daraz Image Repository (/image/upload)
   */
  public async uploadImage(
    fileBuffer: Buffer,
    filename = "image.jpg",
    accessToken?: string
  ): Promise<{ url: string; hash_code?: string }> {
    const { appKey, appSecret, apiUrl } = this.config
    if (!appKey || !appSecret) {
      throw new Error("Daraz credentials missing: DARAZ_APP_KEY and DARAZ_APP_SECRET must be set.")
    }

    const timestamp = Date.now().toString()
    const requestParams: Record<string, any> = {
      app_key: appKey,
      timestamp,
      sign_method: "sha256",
    }
    if (accessToken) {
      requestParams.access_token = accessToken
    }

    const sign = this.generateSignature("/image/upload", requestParams)
    requestParams.sign = sign

    const formData = new FormData()
    for (const [k, v] of Object.entries(requestParams)) {
      formData.append(k, String(v))
    }
    formData.append("image", new Blob([new Uint8Array(fileBuffer.buffer as ArrayBuffer, fileBuffer.byteOffset, fileBuffer.byteLength)]), filename)

    const endpointUrl = `${apiUrl.replace(/\/+$/, "")}/image/upload`
    const res = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "User-Agent": "XINVORA-Listing-Studio/1.0",
      },
      body: formData,
    })

    const responseText = await res.text()
    let json: any
    try {
      json = JSON.parse(responseText)
    } catch {
      throw new Error(`Daraz /image/upload returned non-JSON (HTTP ${res.status}): ${responseText.slice(0, 300)}`)
    }

    if (json.code && json.code !== "0") {
      const errMsg = json.message || json.detail?.[0]?.message || `Image upload error ${json.code}`
      throw new Error(errMsg)
    }

    return {
      url: json.data?.image?.url,
      hash_code: json.data?.image?.hash_code,
    }
  }

  /**
   * Creates a product on Daraz Open Platform (/product/create)
   */
  public async createProduct(
    payloadXml: string,
    accessToken?: string
  ): Promise<{ item_id: string | number; sku_list?: any[] }> {
    const res = await this.execute<{ code: string; data: { item_id: string | number; sku_list?: any[] } }>(
      "/product/create",
      { payload: payloadXml },
      { accessToken, method: "POST" }
    )
    return res.data
  }

  /**
   * Updates an existing product on Daraz (/product/update)
   */
  public async updateProduct(
    payloadXml: string,
    accessToken?: string
  ): Promise<any> {
    return this.execute(
      "/product/update",
      { payload: payloadXml },
      { accessToken, method: "POST" }
    )
  }

  /**
   * Queries Quality Control status of submitted SKUs (/product/qc/status/get)
   */
  public async getQcStatus(
    sellerSkuList: string[],
    accessToken?: string
  ): Promise<any> {
    return this.execute(
      "/product/qc/status/get",
      { seller_sku_list: JSON.stringify(sellerSkuList) },
      { accessToken, method: "GET" }
    )
  }

  /**
   * Retrieves full product detail by item_id (/product/item/get)
   */
  public async getItem(
    itemId: string | number,
    accessToken?: string
  ): Promise<any> {
    return this.execute(
      "/product/item/get",
      { item_id: String(itemId) },
      { accessToken, method: "GET" }
    )
  }

  /**
   * Retrieves payout status and settlement statements (/finance/payout/status/get)
   */
  public async getPayoutStatus(
    createdAfter?: string,
    accessToken?: string
  ): Promise<any> {
    const params: Record<string, any> = {}
    if (createdAfter) {
      params.created_after = createdAfter
    }
    return this.execute("/finance/payout/status/get", params, { accessToken, method: "GET" })
  }

  /**
   * Retrieves detailed transaction fees and item-level deductions (/finance/transaction/detail/get)
   */
  public async getTransactionDetails(
    options: {
      startTime: string
      endTime: string
      transType?: number | string
      tradeOrderId?: string
      limit?: number
      offset?: number
    },
    accessToken?: string
  ): Promise<any> {
    const params: Record<string, any> = {
      start_time: options.startTime,
      end_time: options.endTime,
    }
    if (options.transType !== undefined) params.trans_type = String(options.transType)
    if (options.tradeOrderId) params.trade_order_id = options.tradeOrderId
    if (options.limit) params.limit = options.limit
    if (options.offset) params.offset = options.offset

    return this.execute("/finance/transaction/detail/get", params, { accessToken, method: "GET" })
  }

  /**
   * Retrieves order list with financial and status fields (/orders/get)
   */
  public async getOrders(
    options: {
      createdAfter?: string
      updateAfter?: string
      status?: string
      limit?: number
      offset?: number
    } = {},
    accessToken?: string
  ): Promise<any> {
    const params: Record<string, any> = {}
    if (options.createdAfter) params.created_after = options.createdAfter
    if (options.updateAfter) params.update_after = options.updateAfter
    if (options.status) params.status = options.status
    if (options.limit) params.limit = options.limit
    if (options.offset) params.offset = options.offset

    return this.execute("/orders/get", params, { accessToken, method: "GET" })
  }

  /**
   * Retrieves individual line items and fee components for an order (/order/items/get)
   */
  public async getOrderItems(
    orderId: string | number,
    accessToken?: string
  ): Promise<any> {
    return this.execute("/order/items/get", { order_id: String(orderId) }, { accessToken, method: "GET" })
  }
}
