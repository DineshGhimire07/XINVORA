import { describe, it, expect } from "vitest"
import { DarazClient } from "../src/lib/daraz/client"
import { encryptDarazToken, decryptDarazToken } from "../src/lib/daraz/crypto"
import { buildDarazProductXml, validateProductPayload } from "../src/lib/daraz/payload-builder"
import crypto from "crypto"

describe("DarazClient - Official Signature Algorithm", () => {
  const client = new DarazClient({
    appKey: "123456",
    appSecret: "test_secret_abc123",
    apiUrl: "https://api.daraz.com.np/rest",
    callbackUrl: "https://xinvora.com.np/daraz/callback",
  })

  it("should sort parameter keys alphabetically and generate uppercase HMAC-SHA256", () => {
    const apiPath = "/category/tree/get"
    const params = {
      app_key: "123456",
      timestamp: "1700000000000",
      sign_method: "sha256",
      language_code: "en_US",
    }

    // Expected base string:
    // /category/tree/get + app_key123456 + language_codeen_US + sign_methodsha256 + timestamp1700000000000
    const expectedBaseString =
      "/category/tree/get" +
      "app_key" + "123456" +
      "language_code" + "en_US" +
      "sign_method" + "sha256" +
      "timestamp" + "1700000000000"

    const expectedHmac = crypto
      .createHmac("sha256", "test_secret_abc123")
      .update(expectedBaseString, "utf8")
      .digest("hex")
      .toUpperCase()

    const actualSign = client.generateSignature(apiPath, params)

    expect(actualSign).toBe(expectedHmac)
    expect(actualSign).toMatch(/^[A-F0-9]{64}$/)
  })

  it("should exclude 'sign' parameter and ignore null or undefined values", () => {
    const apiPath = "/product/item/get"
    const params = {
      item_id: "998877",
      sign: "OLD_SIGNATURE_TO_EXCLUDE",
      ignored_null: null as any,
      ignored_undefined: undefined as any,
      app_key: "123456",
    }

    const expectedBaseString = "/product/item/get" + "app_key" + "123456" + "item_id" + "998877"
    const expectedHmac = crypto
      .createHmac("sha256", "test_secret_abc123")
      .update(expectedBaseString, "utf8")
      .digest("hex")
      .toUpperCase()

    const actualSign = client.generateSignature(apiPath, params)
    expect(actualSign).toBe(expectedHmac)
  })
})

describe("Daraz OAuth URL Generation", () => {
  it("should generate the exact registered Nepal callback URL without www", () => {
    const client = new DarazClient({
      appKey: "TEST_APP_KEY",
      appSecret: "TEST_APP_SECRET",
      callbackUrl: "https://xinvora.com.np/daraz/callback",
    })

    const state = "unique_csrf_nonce_999"
    const url = client.getAuthorizationUrl(state)

    expect(url).toContain("https://api.daraz.com.np/oauth/authorize?")
    const parsed = new URL(url)
    expect(parsed.searchParams.get("response_type")).toBe("code")
    expect(parsed.searchParams.get("force_auth")).toBe("true")
    expect(parsed.searchParams.get("client_id")).toBe("TEST_APP_KEY")
    expect(parsed.searchParams.get("state")).toBe("unique_csrf_nonce_999")
    // Strict requirement: exact registered callback URL
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://xinvora.com.np/daraz/callback")
    expect(parsed.searchParams.get("redirect_uri")).not.toContain("www.")
    expect(parsed.searchParams.get("redirect_uri")).not.toContain("/api/daraz")
  })
})

describe("Token Security - AES-256-GCM Vault", () => {
  const secretKey = "test_encryption_secret_key_12345678"

  it("should encrypt and decrypt access tokens losslessly", () => {
    const sampleToken = "50000100a12b34c56d78e90f_daraz_live_access_token_np"
    const encrypted = encryptDarazToken(sampleToken, secretKey)

    expect(encrypted).not.toBe(sampleToken)
    expect(encrypted.split(":")).toHaveLength(3) // iv:ciphertext:tag

    const decrypted = decryptDarazToken(encrypted, secretKey)
    expect(decrypted).toBe(sampleToken)
  })

  it("should fail decryption if ciphertext or authentication tag is tampered", () => {
    const sampleToken = "sample_secure_refresh_token"
    const encrypted = encryptDarazToken(sampleToken, secretKey)
    const [iv, ciphertext, tag] = encrypted.split(":")

    // Tamper with tag
    const corruptedTag = "ff" + tag.slice(2)
    const tampered = `${iv}:${ciphertext}:${corruptedTag}`

    expect(() => decryptDarazToken(tampered, secretKey)).toThrow()
  })
})

describe("Official Daraz CreateProduct XML Builder", () => {
  it("should generate the exact official XML structure matching Daraz OpenAPI specs", () => {
    const xml = buildDarazProductXml({
      primaryCategory: "10001958",
      title: "XINVORA Cute Pinterest Floral Long Skirt",
      brand: "XINVORA",
      highlights: ["Comfortable cotton fabric", "Casual aesthetic styling", "Versatile fit"],
      description: "High quality long skirt for everyday styling in Nepal.",
      normalAttributes: {
        material: "Cotton",
        warranty_type: "No Warranty",
      },
      sku: {
        sellerSku: "XIN-SK-001",
        price: 999.0,
        specialPrice: 899.0,
        quantity: 15,
        colorFamily: "Black",
        packageWeight: 0.35,
        packageLength: 30,
        packageWidth: 25,
        packageHeight: 5,
        packageContent: "1x Long Skirt",
        images: [
          "https://sg-live.slatic.net/original/b731a8098df7d606ab2e56efc650afcb.jpg",
          "https://sg-live.slatic.net/original/image2.jpg",
        ],
      },
    })

    expect(xml).toContain("<PrimaryCategory>10001958</PrimaryCategory>")
    expect(xml).toContain("<name>XINVORA Cute Pinterest Floral Long Skirt</name>")
    expect(xml).toContain("<brand>XINVORA</brand>")
    expect(xml).toContain("<li>Comfortable cotton fabric</li>")
    expect(xml).toContain("<SellerSku>XIN-SK-001</SellerSku>")
    expect(xml).toContain("<price>999.00</price>")
    expect(xml).toContain("<special_price>899.00</special_price>")
    expect(xml).toContain("<quantity>15</quantity>")
    expect(xml).toContain("<color_family>Black</color_family>")
    expect(xml).toContain("<package_weight>0.35</package_weight>")
    expect(xml).toContain("<package_length>30</package_length>")
    expect(xml).toContain("<package_width>25</package_width>")
    expect(xml).toContain("<package_height>5</package_height>")
    expect(xml).toContain("<package_content>1x Long Skirt</package_content>")
    expect(xml).toContain("<Image>https://sg-live.slatic.net/original/b731a8098df7d606ab2e56efc650afcb.jpg</Image>")
    expect(xml).toContain("<Image />") // Blank slots up to 8
  })

  it("should validate mandatory fields and report missing requirements", () => {
    const invalidInput: any = {
      primaryCategory: "",
      title: "",
      sku: {
        sellerSku: "",
        price: -10,
        packageWeight: 0,
        images: [],
      },
    }

    const result = validateProductPayload(invalidInput, [
      { id: "1", name: "material", label: "Material", is_mandatory: 1, attribute_type: "normal", input_type: "text" },
    ])

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors.some((e) => e.includes("primaryCategory"))).toBe(true)
    expect(result.errors.some((e) => e.includes("SellerSku"))).toBe(true)
    expect(result.errors.some((e) => e.includes("Material"))).toBe(true)
  })
})
