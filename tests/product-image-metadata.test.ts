/**
 * tests/product-image-metadata.test.ts
 *
 * Deterministic Collection-Driven Image Role & SEO Metadata Test Suite.
 * Validates:
 * 1. Strictly deterministic position-to-role template resolution (Zero AI, Zero Guessing).
 * 2. Tops standard sequence: 1->Lifestyle, 2->Front Close-Up, 3->Front, 4->Back.
 * 3. Position overflow handling (Position > Template length -> null role, Photo N fallback).
 * 4. Alt text generation format: "{productName} - {roleLabel}".
 * 5. Title generation format: matches alt text.
 * 6. Recommended SEO filename generation (Metadata only, kebab-cased).
 * 7. Manual alt text preservation (altTextSource = 'manual' never overwritten).
 * 8. Image reordering metadata synchronization.
 */

import { describe, it, expect } from "vitest"
import { ProductImageMetadataService } from "../src/domains/seo/services/product-image-metadata.service"

describe("ProductImageMetadataService — Deterministic Image Roles & SEO Metadata", () => {
  const topsTemplate = {
    id: "tpl-tops-001",
    name: "Tops Standard Photography Template",
    collectionId: "col-tops-001",
    isActive: true,
    roles: [
      { position: 1, role: "lifestyle", label: "Lifestyle" },
      { position: 2, role: "front_closeup", label: "Front Close-Up" },
      { position: 3, role: "front", label: "Front" },
      { position: 4, role: "back", label: "Back" },
    ],
  }

  describe("resolveImageRole", () => {
    it("resolves exact role and label for configured positions in Tops template", () => {
      const pos1 = ProductImageMetadataService.resolveImageRole(1, topsTemplate)
      expect(pos1).toEqual({ role: "lifestyle", label: "Lifestyle" })

      const pos2 = ProductImageMetadataService.resolveImageRole(2, topsTemplate)
      expect(pos2).toEqual({ role: "front_closeup", label: "Front Close-Up" })

      const pos3 = ProductImageMetadataService.resolveImageRole(3, topsTemplate)
      expect(pos3).toEqual({ role: "front", label: "Front" })

      const pos4 = ProductImageMetadataService.resolveImageRole(4, topsTemplate)
      expect(pos4).toEqual({ role: "back", label: "Back" })
    })

    it("returns null for positions beyond template length without guessing", () => {
      const pos5 = ProductImageMetadataService.resolveImageRole(5, topsTemplate)
      expect(pos5).toBeNull()

      const pos6 = ProductImageMetadataService.resolveImageRole(6, topsTemplate)
      expect(pos6).toBeNull()
    })

    it("returns null when template is null or empty", () => {
      expect(ProductImageMetadataService.resolveImageRole(1, null)).toBeNull()
      expect(ProductImageMetadataService.resolveImageRole(1, undefined)).toBeNull()
      expect(ProductImageMetadataService.resolveImageRole(1, { id: "1", name: "Empty", collectionId: null, isActive: true, roles: [] })).toBeNull()
    })
  })

  describe("generateImageAltText", () => {
    it("generates '{productName} - {roleLabel}' when role exists", () => {
      const alt = ProductImageMetadataService.generateImageAltText(
        "Black Sculpt Crop Top",
        "Lifestyle",
        1
      )
      expect(alt).toBe("Black Sculpt Crop Top - Lifestyle")

      const alt2 = ProductImageMetadataService.generateImageAltText(
        "Black Sculpt Crop Top",
        "Front Close-Up",
        2
      )
      expect(alt2).toBe("Black Sculpt Crop Top - Front Close-Up")
    })

    it("generates '{productName} - Photo {position}' fallback when role is null", () => {
      const alt = ProductImageMetadataService.generateImageAltText(
        "Black Sculpt Crop Top",
        null,
        5
      )
      expect(alt).toBe("Black Sculpt Crop Top - Photo 5")
    })
  })

  describe("generateImageTitle", () => {
    it("generates media title matching alt text convention", () => {
      const title = ProductImageMetadataService.generateImageTitle(
        "Silk Corset",
        "Front",
        3
      )
      expect(title).toBe("Silk Corset - Front")
    })
  })

  describe("generateRecommendedFilename", () => {
    it("generates clean SEO filename slug with role name and webp extension", () => {
      const filename = ProductImageMetadataService.generateRecommendedFilename(
        "black-sculpt-crop-top",
        "lifestyle",
        1,
        "https://res.cloudinary.com/xinvora/image/upload/v123/master.jpg"
      )
      expect(filename).toBe("black-sculpt-crop-top-lifestyle.jpg")

      const filename2 = ProductImageMetadataService.generateRecommendedFilename(
        "black-sculpt-crop-top",
        "front_closeup",
        2,
        "https://res.cloudinary.com/xinvora/image/upload/v123/master.webp"
      )
      expect(filename2).toBe("black-sculpt-crop-top-front-closeup.webp")
    })

    it("generates photo-N filename when role is null", () => {
      const filename = ProductImageMetadataService.generateRecommendedFilename(
        "silk-corset-top",
        null,
        5
      )
      expect(filename).toBe("silk-corset-top-photo-5.webp")
    })
  })

  describe("generateMetadataForProduct (Batch & Overrides)", () => {
    it("generates complete deterministic metadata array for product images", () => {
      const images = [
        { url: "https://res.cloudinary.com/xinvora/image/upload/img1.jpg" },
        { url: "https://res.cloudinary.com/xinvora/image/upload/img2.jpg" },
        { url: "https://res.cloudinary.com/xinvora/image/upload/img3.jpg" },
        { url: "https://res.cloudinary.com/xinvora/image/upload/img4.jpg" },
        { url: "https://res.cloudinary.com/xinvora/image/upload/img5.jpg" },
      ]

      const result = ProductImageMetadataService.generateMetadataForProduct({
        productName: "Black Sculpt Crop Top",
        productSlug: "black-sculpt-crop-top",
        images,
        template: topsTemplate,
      })

      expect(result).toHaveLength(5)

      // Position 1
      expect(result[0]).toMatchObject({
        position: 1,
        imageRole: "lifestyle",
        roleLabel: "Lifestyle",
        altText: "Black Sculpt Crop Top - Lifestyle",
        altTextSource: "auto",
        recommendedFilename: "black-sculpt-crop-top-lifestyle.jpg",
      })

      // Position 2
      expect(result[1]).toMatchObject({
        position: 2,
        imageRole: "front_closeup",
        roleLabel: "Front Close-Up",
        altText: "Black Sculpt Crop Top - Front Close-Up",
        altTextSource: "auto",
        recommendedFilename: "black-sculpt-crop-top-front-closeup.jpg",
      })

      // Position 3
      expect(result[2]).toMatchObject({
        position: 3,
        imageRole: "front",
        roleLabel: "Front",
        altText: "Black Sculpt Crop Top - Front",
        altTextSource: "auto",
        recommendedFilename: "black-sculpt-crop-top-front.jpg",
      })

      // Position 4
      expect(result[3]).toMatchObject({
        position: 4,
        imageRole: "back",
        roleLabel: "Back",
        altText: "Black Sculpt Crop Top - Back",
        altTextSource: "auto",
        recommendedFilename: "black-sculpt-crop-top-back.jpg",
      })

      // Position 5 (Beyond template length -> null role, Photo 5 fallback)
      expect(result[4]).toMatchObject({
        position: 5,
        imageRole: null,
        roleLabel: null,
        altText: "Black Sculpt Crop Top - Photo 5",
        altTextSource: "auto",
        recommendedFilename: "black-sculpt-crop-top-photo-5.jpg",
      })
    })

    it("strictly preserves manual alt text overrides (altTextSource = 'manual')", () => {
      const images = [
        {
          url: "https://res.cloudinary.com/xinvora/image/upload/img1.jpg",
          altText: "Hand-stitched Italian Silk Fabric Detail on Runway Model",
          altTextSource: "manual" as const,
        },
        {
          url: "https://res.cloudinary.com/xinvora/image/upload/img2.jpg",
          altText: null,
          altTextSource: "auto" as const,
        },
      ]

      const result = ProductImageMetadataService.generateMetadataForProduct({
        productName: "Black Sculpt Crop Top",
        productSlug: "black-sculpt-crop-top",
        images,
        template: topsTemplate,
      })

      // Position 1 role is assigned, but manual alt text is NEVER overwritten
      expect(result[0].imageRole).toBe("lifestyle")
      expect(result[0].altTextSource).toBe("manual")
      expect(result[0].altText).toBe("Hand-stitched Italian Silk Fabric Detail on Runway Model")

      // Position 2 auto generates
      expect(result[1].imageRole).toBe("front_closeup")
      expect(result[1].altTextSource).toBe("auto")
      expect(result[1].altText).toBe("Black Sculpt Crop Top - Front Close-Up")
    })

    it("correctly handles image reordering where previous Back image is moved to Position 1", () => {
      // Suppose image originally at back (position 4) is moved to index 0 (position 1)
      const reorderedImages = [
        { url: "https://res.cloudinary.com/xinvora/image/upload/original-back-image.jpg" },
        { url: "https://res.cloudinary.com/xinvora/image/upload/original-front-closeup.jpg" },
        { url: "https://res.cloudinary.com/xinvora/image/upload/original-front.jpg" },
        { url: "https://res.cloudinary.com/xinvora/image/upload/original-lifestyle.jpg" },
      ]

      const result = ProductImageMetadataService.generateMetadataForProduct({
        productName: "Black Sculpt Crop Top",
        productSlug: "black-sculpt-crop-top",
        images: reorderedImages,
        template: topsTemplate,
      })

      // New position 1 inherits Lifestyle role and alt text
      expect(result[0].position).toBe(1)
      expect(result[0].imageRole).toBe("lifestyle")
      expect(result[0].altText).toBe("Black Sculpt Crop Top - Lifestyle")
      expect(result[0].recommendedFilename).toBe("black-sculpt-crop-top-lifestyle.jpg")

      // New position 4 inherits Back role and alt text
      expect(result[3].position).toBe(4)
      expect(result[3].imageRole).toBe("back")
      expect(result[3].altText).toBe("Black Sculpt Crop Top - Back")
      expect(result[3].recommendedFilename).toBe("black-sculpt-crop-top-back.jpg")
    })
  })
})
