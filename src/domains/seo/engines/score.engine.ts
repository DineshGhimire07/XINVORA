import type { NormalizedSEOEntity } from "../contracts/entity.contract"

export interface ScoreInspectorItem {
  id: string
  name: string
  category: string
  status: "PASSED" | "WARNING" | "FAILED"
  score: number
  maxScore: number
  detectedValue: string
  length?: number
  recommendation: string
  impact: string
}

export interface DetailedSEOScoreReport {
  score: number
  grade: "A+" | "A" | "B" | "C" | "D" | "F"
  breakdown: ScoreInspectorItem[]
}

export class SEOScoreEngine {
  public static calculateEntityScore(entity: NormalizedSEOEntity): DetailedSEOScoreReport {
    const breakdown: ScoreInspectorItem[] = []

    // 1. Title Check (Max 25)
    const title = entity.seoTitle || entity.name || ""
    const titleLen = title.trim().length
    if (titleLen >= 15 && titleLen <= 70) {
      breakdown.push({
        id: "title",
        name: "SEO Title Tag",
        category: "METADATA",
        status: "PASSED",
        score: 25,
        maxScore: 25,
        detectedValue: title,
        length: titleLen,
        recommendation: "Optimal title length and focus keyword placement.",
        impact: "HIGH",
      })
    } else if (titleLen > 0) {
      breakdown.push({
        id: "title",
        name: "SEO Title Tag",
        category: "METADATA",
        status: "WARNING",
        score: 15,
        maxScore: 25,
        detectedValue: title,
        length: titleLen,
        recommendation: titleLen < 15 ? "Title is short. Recommend expanding to 30-60 characters." : "Title exceeds 60 characters and may be truncated on Google SERPs.",
        impact: "HIGH",
      })
    } else {
      breakdown.push({
        id: "title",
        name: "SEO Title Tag",
        category: "METADATA",
        status: "FAILED",
        score: 0,
        maxScore: 25,
        detectedValue: "Missing",
        length: 0,
        recommendation: "Add a compelling SEO title tag with target search terms.",
        impact: "CRITICAL",
      })
    }

    // 2. Meta Description Check (Max 25)
    const desc = entity.seoDescription || ""
    const descLen = desc.trim().length
    if (descLen >= 50 && descLen <= 160) {
      breakdown.push({
        id: "description",
        name: "Meta Description",
        category: "METADATA",
        status: "PASSED",
        score: 25,
        maxScore: 25,
        detectedValue: desc,
        length: descLen,
        recommendation: "Ideal meta description length.",
        impact: "HIGH",
      })
    } else if (descLen > 0) {
      breakdown.push({
        id: "description",
        name: "Meta Description",
        category: "METADATA",
        status: "WARNING",
        score: 15,
        maxScore: 25,
        detectedValue: desc,
        length: descLen,
        recommendation: descLen < 50 ? "Expand meta description to at least 70 characters." : "Meta description exceeds 160 characters.",
        impact: "MEDIUM",
      })
    } else {
      breakdown.push({
        id: "description",
        name: "Meta Description",
        category: "METADATA",
        status: "FAILED",
        score: 0,
        maxScore: 25,
        detectedValue: "Missing",
        length: 0,
        recommendation: "Write a high-converting meta description summary.",
        impact: "HIGH",
      })
    }

    // 3. Canonical Tag Check (Max 20)
    if (entity.canonicalUrl && entity.canonicalUrl.trim().length > 0) {
      breakdown.push({
        id: "canonical",
        name: "Canonical URL",
        category: "INDEXING",
        status: "PASSED",
        score: 20,
        maxScore: 20,
        detectedValue: entity.canonicalUrl,
        recommendation: "Valid canonical URL reference present.",
        impact: "HIGH",
      })
    } else {
      breakdown.push({
        id: "canonical",
        name: "Canonical URL",
        category: "INDEXING",
        status: "FAILED",
        score: 0,
        maxScore: 20,
        detectedValue: "Missing",
        recommendation: "Set an explicit canonical URL to prevent duplicate content indexing.",
        impact: "HIGH",
      })
    }

    // 4. OpenGraph & Social Image (Max 15)
    if (entity.ogImage && entity.ogImage.trim().length > 0) {
      breakdown.push({
        id: "og_image",
        name: "OpenGraph Image",
        category: "SOCIAL",
        status: "PASSED",
        score: 15,
        maxScore: 15,
        detectedValue: entity.ogImage,
        recommendation: "Social share card image configured.",
        impact: "MEDIUM",
      })
    } else {
      breakdown.push({
        id: "og_image",
        name: "OpenGraph Image",
        category: "SOCIAL",
        status: "FAILED",
        score: 0,
        maxScore: 15,
        detectedValue: "Missing",
        recommendation: "Attach an OpenGraph preview image for social sharing.",
        impact: "MEDIUM",
      })
    }

    // 5. Image ALT Text Check (Max 15)
    const images = entity.images || []
    if (images.length === 0) {
      breakdown.push({
        id: "image_alt",
        name: "Image Accessibility & ALT",
        category: "IMAGES",
        status: "PASSED",
        score: 15,
        maxScore: 15,
        detectedValue: "No images attached",
        recommendation: "Consider attaching high quality visual assets.",
        impact: "LOW",
      })
    } else {
      const missingAltCount = images.filter((img) => !img.alt || img.alt.trim().length === 0).length
      if (missingAltCount === 0) {
        breakdown.push({
          id: "image_alt",
          name: "Image Accessibility & ALT",
          category: "IMAGES",
          status: "PASSED",
          score: 15,
          maxScore: 15,
          detectedValue: `${images.length}/${images.length} images have ALT text`,
          recommendation: "All images feature ALT descriptions.",
          impact: "MEDIUM",
        })
      } else {
        const passRatio = (images.length - missingAltCount) / images.length
        const gainedScore = Math.round(15 * passRatio)
        breakdown.push({
          id: "image_alt",
          name: "Image Accessibility & ALT",
          category: "IMAGES",
          status: gainedScore > 0 ? "WARNING" : "FAILED",
          score: gainedScore,
          maxScore: 15,
          detectedValue: `${missingAltCount} image(s) missing ALT text`,
          recommendation: "Add descriptive ALT attributes to all product and article images.",
          impact: "MEDIUM",
        })
      }
    }

    const totalScore = breakdown.reduce((acc, curr) => acc + curr.score, 0)
    let grade: "A+" | "A" | "B" | "C" | "D" | "F" = "F"
    if (totalScore >= 95) grade = "A+"
    else if (totalScore >= 85) grade = "A"
    else if (totalScore >= 75) grade = "B"
    else if (totalScore >= 65) grade = "C"
    else if (totalScore >= 50) grade = "D"

    return {
      score: totalScore,
      grade,
      breakdown,
    }
  }
}
