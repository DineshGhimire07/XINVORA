import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"
import { eq } from "drizzle-orm"
import { journalCategories, journalTags, journalPosts, journalPostTags, journalRevisions, users } from "../src/db/schema"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

async function importContent() {
  console.log("🚀 Starting XINVORA Journal Content Package Import...")

  // 1. Get or create Author
  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.role, "ADMIN"))
    .limit(1)

  if (!adminUser) {
    throw new Error("No admin user found in database to assign as author.")
  }
  console.log(`👤 Using Author: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.id})`)

  // 2. Get or create Category: "Styling Guides" (slug: "styling-guides")
  let [category] = await db
    .select()
    .from(journalCategories)
    .where(eq(journalCategories.slug, "styling-guides"))
    .limit(1)

  if (!category) {
    console.log("📁 Category 'Styling Guides' not found. Creating it...")
    const [newCat] = await db
      .insert(journalCategories)
      .values({
        name: "Styling Guides",
        slug: "styling-guides",
        description: "Editorial guides and advice on styling quiet luxury silhouettes, outfits, and seasonal capsules.",
      })
      .returning()
    category = newCat
    console.log(`✅ Created category: ${category.name} (${category.id})`)
  } else {
    console.log(`📁 Found category: ${category.name} (${category.id})`)
  }

  // Also ensure standard categories exist for the public page navigation
  const defaultCategories = [
    { name: "Craft", slug: "craft", description: "Artisan craftsmanship and atelier notes." },
    { name: "Collections", slug: "collections", description: "Seasonal drops and capsule breakdowns." },
    { name: "Materials", slug: "materials", description: "Fabric provenance, weaves, and sustainable luxury." },
    { name: "Inspiration", slug: "inspiration", description: "Mood boards, architecture, and design aesthetics." },
    { name: "Lifestyle", slug: "lifestyle", description: "Mindful living and modern wardrobe curation." }
  ]

  for (const defCat of defaultCategories) {
    await db.insert(journalCategories).values(defCat).onConflictDoNothing()
  }

  // 3. Create or resolve Tags
  const tagNames = [
    "black bodycon dress",
    "bodycon dress styling",
    "black dress outfits",
    "outfit ideas",
    "women's fashion",
    "casual outfits",
    "party outfits",
    "Nepal fashion"
  ]

  const tagIds: string[] = []
  for (const name of tagNames) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

    let [existingTag] = await db
      .select()
      .from(journalTags)
      .where(eq(journalTags.slug, slug))
      .limit(1)

    if (!existingTag) {
      const [newTag] = await db
        .insert(journalTags)
        .values({ name, slug })
        .returning()
      existingTag = newTag
    }
    tagIds.push(existingTag.id)
  }
  console.log(`🏷️ Resolved ${tagIds.length} tags.`)

  // 4. Structured Body Blocks
  const blocks = [
    {
      id: "b_intro_1",
      type: "paragraph",
      data: {
        text: "A <strong>black bodycon dress</strong> is one of those pieces that can completely change depending on what you wear with it.<br/><br/>Keep the accessories minimal and it works for a casual day. Add sneakers and an oversized layer for a relaxed look. Switch to heels and statement jewellery, and the same dress is ready for dinner or a party.<br/><br/>The secret is not owning more clothes. It is knowing how to change the mood of the pieces you already have.<br/><br/>Here are seven ways to style a black bodycon dress for different plans, personalities, and levels of dressing up."
      }
    },
    {
      id: "b_h2_1",
      type: "heading",
      data: {
        level: 2,
        text: "1. Keep It Casual With Sneakers"
      }
    },
    {
      id: "b_p_1",
      type: "paragraph",
      data: {
        text: "The easiest way to make a fitted black dress feel relaxed? Add sneakers.<br/><br/>A pair of clean white sneakers creates contrast against the black dress, while chunky sneakers can give the outfit a more streetwear-inspired feel. Add a simple shoulder bag and keep jewellery understated.<br/><br/>For a daytime outfit, try:<br/>• Black bodycon dress<br/>• White or neutral sneakers<br/>• Small shoulder bag<br/>• Simple hoops or studs<br/>• Sunglasses<br/><br/>This combination works especially well when you want the dress to feel wearable rather than overly dressed-up."
      }
    },
    {
      id: "b_callout_1",
      type: "callout",
      data: {
        title: "Style Tip",
        text: "If your dress is midi length, low-profile sneakers can create a clean silhouette. Chunkier shoes work particularly well with mini bodycon dresses.",
        type: "info"
      }
    },
    {
      id: "b_img_1",
      type: "image",
      data: {
        urls: [
          "https://images.openai.com/static-rsc-4/qRoN6LMkfyUac8TicGc0eB0vCC6EyftiUNKOQGgUNIHe9eCLkZ_yD9utzzuRKXqDiOIJPUcrD5kKiaCGYXdNaSJ8OeBIR-IB7fxttj5t9ue810klhiR1k5iROo2f3Ry_ZOXaSbBt7_hZD8v4ktX06ix3RUCwnIR3iAIGROEPNjvczehn0AUPrurAtpITtLLF?purpose=fullsize"
        ],
        caption: "A fitted black dress can feel completely casual with the right pair of sneakers."
      }
    },
    {
      id: "b_h2_2",
      type: "heading",
      data: {
        level: 2,
        text: "2. Add an Oversized Shirt for an Effortless Layer"
      }
    },
    {
      id: "b_p_2",
      type: "paragraph",
      data: {
        text: "An oversized shirt changes the proportions of a bodycon dress instantly.<br/><br/>Try a crisp white shirt for a high-contrast look, or choose denim, blue, beige, or another neutral for something softer. Wear it open over the dress or tie it loosely at the waist.<br/><br/>This is also a useful option when you want a little more coverage without hiding the shape of the dress completely."
      }
    },
    {
      id: "b_callout_2",
      type: "callout",
      data: {
        title: "Outfit Formula",
        text: "Black bodycon dress + oversized shirt + sneakers + shoulder bag. (For a more polished version, swap the sneakers for loafers or simple flats.)",
        type: "info"
      }
    },
    {
      id: "b_h2_3",
      type: "heading",
      data: {
        level: 2,
        text: "3. Go Minimal With a Blazer"
      }
    },
    {
      id: "b_p_3",
      type: "paragraph",
      data: {
        text: "For a sharper take, layer a structured blazer over your black dress.<br/><br/>A black blazer creates a sleek monochrome outfit, while a grey, beige, cream, or pinstriped blazer adds contrast. Keep the rest of the outfit relatively simple so the clean lines of the blazer and dress do the work.<br/><br/>This look can transition easily from a dinner plan to an evening event.<br/><br/>Try adding:<br/>• Structured blazer<br/>• Small handbag<br/>• Minimal jewellery<br/>• Pointed flats or heels<br/><br/>A slightly oversized blazer can also balance the fitted silhouette of the dress, giving the outfit a more relaxed editorial feel."
      }
    },
    {
      id: "b_img_2",
      type: "image",
      data: {
        urls: [
          "https://images.openai.com/static-rsc-4/_zFaVYi853kdjizVz7xPuRG8ITsCklFg4fXuN7YRULUMUniGTiKNn71rDWJyCWOxZvFrXt1fa0xTZJXGg8ZxEl180bkF3Xpt-4gntg8qifT2XZTA-mOvYVDYi-jTkQBz97CjFs9CBOPoJd4kmgWuadFmCI8Uf40sgeWh9uXYaF75sSXidA8bd7oUfrB3KRxF?purpose=fullsize"
        ],
        caption: "A structured blazer adds polish while balancing the fitted silhouette."
      }
    },
    {
      id: "b_h2_4",
      type: "heading",
      data: {
        level: 2,
        text: "4. Make It Edgy With a Leather Jacket"
      }
    },
    {
      id: "b_p_4",
      type: "paragraph",
      data: {
        text: "If a blazer feels too polished, reach for a leather jacket.<br/><br/>The contrast between a fitted dress and a slightly oversized jacket gives the outfit a stronger, more rebellious mood. Add boots for an evening look or sneakers for daytime.<br/><br/>Black-on-black works particularly well here. If everything feels too dark, introduce contrast through a silver bag, metallic jewellery, sunglasses, or a lighter shoe."
      }
    },
    {
      id: "b_callout_3",
      type: "callout",
      data: {
        title: "Edgy Combination",
        text: "Black bodycon dress + leather jacket + ankle boots + silver jewellery. The key is restraint — you do not need several statement pieces at once.",
        type: "info"
      }
    },
    {
      id: "b_h2_5",
      type: "heading",
      data: {
        level: 2,
        text: "5. Style It for a Date Night"
      }
    },
    {
      id: "b_p_5",
      type: "paragraph",
      data: {
        text: "A black dress already has a strong evening foundation, so you can keep the styling simple.<br/><br/>Choose delicate jewellery, a compact handbag, and heels or elegant flats. Instead of piling on accessories, focus on one or two details that feel intentional.<br/><br/>For example, gold jewellery can add warmth, while silver accessories create a cooler, more modern effect.<br/><br/>For a date-night outfit:<br/>• Black bodycon dress<br/>• Strappy heels or pointed flats<br/>• Small handbag<br/>• One statement jewellery piece<br/>• Soft, polished makeup<br/><br/>If the dress has an interesting neckline or back detail, let that feature remain the focal point."
      }
    },
    {
      id: "b_h2_6",
      type: "heading",
      data: {
        level: 2,
        text: "6. Give It a Party-Ready Finish"
      }
    },
    {
      id: "b_p_6",
      type: "paragraph",
      data: {
        text: "For parties, accessories can completely change a simple black dress.<br/><br/>Try metallic heels, a sparkly mini bag, bold earrings, or a statement belt. You can also experiment with texture: patent shoes, metallic finishes, or glossy accessories create visual interest without requiring a different dress.<br/><br/>The best approach is to choose <strong>one main statement</strong>. If you are wearing bold earrings, keep the bag and shoes simpler. If your shoes are the standout piece, let the jewellery stay minimal."
      }
    },
    {
      id: "b_img_3",
      type: "image",
      data: {
        urls: [
          "https://images.openai.com/static-rsc-4/bePB2W5k6jGYktp2zAPhpWokXNDNwkpUKtOisqKuCRaSaDGnktDBoFkCqYyy4XwGqWz5PAUyTA9Mc5R-Tp1J876dz2pcifqqA2kZeGuO8y-JbLtrm4xodfYuskWl9ioJf6_lrZc8KBRgQJO0f0YAdF0V870wtyuqT4DdGqqDS15kax1erTeEFwwORKC7a1_r?purpose=fullsize"
        ],
        caption: "Statement accessories can transform a simple black dress into a party look."
      }
    },
    {
      id: "b_h2_7",
      type: "heading",
      data: {
        level: 2,
        text: "7. Create a Monochrome Look"
      }
    },
    {
      id: "b_p_7",
      type: "paragraph",
      data: {
        text: "When in doubt, wear black with black.<br/><br/>A monochrome outfit does not have to mean that every piece looks identical. Play with proportions, textures, and finishes instead.<br/><br/>Pair your black bodycon dress with:<br/>• Black boots or heels<br/>• Black handbag<br/>• Black blazer or leather jacket<br/>• Silver or gold jewellery<br/>• Black sunglasses<br/><br/>The result feels streamlined without being boring. A useful trick is to mix textures: a smooth fitted dress with a structured blazer, leather bag, or textured shoes gives the outfit dimension while keeping the colour palette simple."
      }
    },
    {
      id: "b_h2_8",
      type: "heading",
      data: {
        level: 2,
        text: "How to Make One Black Dress Feel Like Several Outfits"
      }
    },
    {
      id: "b_p_8",
      type: "paragraph",
      data: {
        text: "The versatility of a black bodycon dress comes down to the styling pieces around it. Think about the role each item plays:<br/><br/>• <strong>Sneakers</strong> → casual and daytime<br/>• <strong>Oversized shirt</strong> → relaxed and layered<br/>• <strong>Blazer</strong> → polished and structured<br/>• <strong>Leather jacket</strong> → edgy and urban<br/>• <strong>Heels + delicate jewellery</strong> → date night<br/>• <strong>Statement accessories</strong> → party-ready<br/>• <strong>All-black styling</strong> → sleek and minimalist<br/><br/>You can also change the look through smaller details. A different bag, hairstyle, shoe, or jewellery combination can make the same dress feel noticeably different."
      }
    },
    {
      id: "b_h2_9",
      type: "heading",
      data: {
        level: 2,
        text: "The Bottom Line"
      }
    },
    {
      id: "b_p_9",
      type: "paragraph",
      data: {
        text: "A black bodycon dress does not need to be reserved for nights out. The right layers and accessories can take it from casual daytime dressing to dinner, parties, and more polished occasions. Start with the mood you want, then build around the dress rather than trying to change the dress itself.<br/><br/>If you already have a black bodycon dress in your wardrobe, experiment with your sneakers, jackets, shirts, bags, and jewellery before buying something new. You may have more outfit combinations than you think."
      }
    },
    {
      id: "b_divider_1",
      type: "divider",
      data: {}
    },
    {
      id: "b_faq_1",
      type: "faq",
      data: {
        question: "Can you wear a black bodycon dress casually?",
        answer: "Yes. Sneakers, an oversized shirt, denim layer, or relaxed jacket can make a black bodycon dress feel much more casual and suitable for daytime."
      }
    },
    {
      id: "b_faq_2",
      type: "faq",
      data: {
        question: "What shoes go with a black bodycon dress?",
        answer: "Sneakers, boots, flats, and heels can all work. Choose the shoe based on the occasion and the mood you want rather than treating the dress as strictly formal."
      }
    },
    {
      id: "b_faq_3",
      type: "faq",
      data: {
        question: "How can I make a bodycon dress look less dressy?",
        answer: "Add relaxed layers such as an oversized shirt, casual jacket, or blazer and pair them with sneakers or simple flats."
      }
    },
    {
      id: "b_faq_4",
      type: "faq",
      data: {
        question: "What accessories look good with a black bodycon dress?",
        answer: "The dress works with both minimal and statement accessories. Simple hoops and a small bag create a clean look, while metallic jewellery or a statement bag can make it more suitable for an evening or party."
      }
    }
  ]

  const postSlug = "style-black-bodycon-dress"
  const coverImageUrl = "https://images.openai.com/static-rsc-4/qRoN6LMkfyUac8TicGc0eB0vCC6EyftiUNKOQGgUNIHe9eCLkZ_yD9utzzuRKXqDiOIJPUcrD5kKiaCGYXdNaSJ8OeBIR-IB7fxttj5t9ue810klhiR1k5iROo2f3Ry_ZOXaSbBt7_hZD8v4ktX06ix3RUCwnIR3iAIGROEPNjvczehn0AUPrurAtpITtLLF?purpose=fullsize"

  const postData = {
    slug: postSlug,
    title: "7 Ways to Style a Black Bodycon Dress",
    excerpt: "A black bodycon dress can go far beyond a night-out look. Here are 7 easy ways to style it for casual days, college, dates, parties, and everything in between.",
    body: blocks,
    coverImage: coverImageUrl,
    gallery: [
      coverImageUrl,
      "https://images.openai.com/static-rsc-4/_zFaVYi853kdjizVz7xPuRG8ITsCklFg4fXuN7YRULUMUniGTiKNn71rDWJyCWOxZvFrXt1fa0xTZJXGg8ZxEl180bkF3Xpt-4gntg8qifT2XZTA-mOvYVDYi-jTkQBz97CjFs9CBOPoJd4kmgWuadFmCI8Uf40sgeWh9uXYaF75sSXidA8bd7oUfrB3KRxF?purpose=fullsize",
      "https://images.openai.com/static-rsc-4/bePB2W5k6jGYktp2zAPhpWokXNDNwkpUKtOisqKuCRaSaDGnktDBoFkCqYyy4XwGqWz5PAUyTA9Mc5R-Tp1J876dz2pcifqqA2kZeGuO8y-JbLtrm4xodfYuskWl9ioJf6_lrZc8KBRgQJO0f0YAdF0V870wtyuqT4DdGqqDS15kax1erTeEFwwORKC7a1_r?purpose=fullsize"
    ],
    authorId: adminUser.id,
    categoryId: category.id,
    workflowState: "PUBLISHED",
    visibility: "PUBLIC",
    isFeatured: true,
    isPinned: false,
    allowComments: true,
    readingTimeOverride: 4,
    locale: "en",
    seoTitle: "7 Ways to Style a Black Bodycon Dress",
    metaDescription: "Discover 7 ways to style a black bodycon dress, from casual sneakers and layers to party-ready heels and statement accessories.",
    canonicalUrl: `/journal/${postSlug}`,
    ogTitle: "7 Ways to Style a Black Bodycon Dress",
    ogDescription: "Discover 7 ways to style a black bodycon dress, from casual sneakers and layers to party-ready heels and statement accessories.",
    ogImage: coverImageUrl,
    twitterTitle: "7 Ways to Style a Black Bodycon Dress",
    twitterDescription: "Discover 7 ways to style a black bodycon dress, from casual sneakers and layers to party-ready heels and statement accessories.",
    twitterImage: coverImageUrl,
    robotsIndex: true,
    robotsFollow: true,
    focusKeyword: "black bodycon dress",
    publishedAt: new Date(),
    updatedAt: new Date(),
  }

  // 5. Upsert Post
  const [existing] = await db
    .select()
    .from(journalPosts)
    .where(eq(journalPosts.slug, postSlug))
    .limit(1)

  let savedPost: any
  if (existing) {
    console.log(`🔄 Existing post found (${existing.id}). Updating...`)
    const [updated] = await db
      .update(journalPosts)
      .set(postData)
      .where(eq(journalPosts.id, existing.id))
      .returning()
    savedPost = updated
  } else {
    console.log(`✨ Creating new post...`)
    const [inserted] = await db
      .insert(journalPosts)
      .values(postData)
      .returning()
    savedPost = inserted
  }

  // 6. Link Tags
  await db.delete(journalPostTags).where(eq(journalPostTags.postId, savedPost.id))
  for (const tagId of tagIds) {
    await db.insert(journalPostTags).values({
      postId: savedPost.id,
      tagId,
    }).onConflictDoNothing()
  }

  // 7. Create initial revision snapshot
  await db.insert(journalRevisions).values({
    postId: savedPost.id,
    revisionData: postData,
    changedById: adminUser.id,
  })

  console.log(`\n🎉 Content Package Successfully Imported!`)
  console.log(`📄 ID: ${savedPost.id}`)
  console.log(`🔗 Slug: /journal/${savedPost.slug}`)
  console.log(`📊 State: ${savedPost.workflowState}`)
  console.log(`🏷️ Tags: ${tagNames.join(", ")}`)

  await sql.end()
}

importContent().catch((err) => {
  console.error("❌ Import failed:", err)
  process.exit(1)
})
