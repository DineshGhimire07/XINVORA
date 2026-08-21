import { NextResponse } from "next/server"
import { db } from "@/db/client"
import { mediaLibrary } from "@/db/schema/media"
import { productImages } from "@/db/schema/product-images"
import { products } from "@/db/schema/products"
import { isNull, eq } from "drizzle-orm"

export async function GET() {
  try {
    const media = await db.select({ url: mediaLibrary.url }).from(mediaLibrary).where(isNull(mediaLibrary.deletedAt)).limit(5)
    const pImgs = await db
      .select({ url: productImages.url, productName: products.name })
      .from(productImages)
      .innerJoin(products, eq(productImages.productId, products.id))
      .where(isNull(products.deletedAt))
      .limit(5)

    return NextResponse.json({
      mediaSample: media.map(m => ({ url: m.url, length: m.url?.length })),
      productImageSample: pImgs.map(p => ({ url: p.url, productName: p.productName, length: p.url?.length })),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
