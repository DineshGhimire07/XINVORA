// scripts/import-quiet-luxury-article.ts
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

async function importQuietLuxury() {
  console.log("🚀 Starting Quiet Luxury Article Import...")

  const [adminUser] = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1)
  if (!adminUser) throw new Error("No admin user found.")
  console.log(`👤 Author: ${adminUser.firstName} ${adminUser.lastName}`)

  // Ensure "Styling Guides" category
  let [category] = await db.select().from(journalCategories).where(eq(journalCategories.slug, "styling-guides")).limit(1)
  if (!category) {
    const [newCat] = await db.insert(journalCategories).values({
      name: "Styling Guides",
      slug: "styling-guides",
      description: "Editorial guides and advice on styling, outfits, and building your personal wardrobe.",
    }).returning()
    category = newCat
  }
  console.log(`📁 Category: ${category.name}`)

  // Tags
  const tagNames = [
    "quiet luxury",
    "old money aesthetic",
    "quiet luxury outfit",
    "minimalist fashion",
    "Nepal fashion",
    "styling tips",
    "women's fashion",
    "slow fashion",
    "wardrobe essentials",
    "outfit ideas",
  ]

  const tagIds: string[] = []
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    let [tag] = await db.select().from(journalTags).where(eq(journalTags.slug, slug)).limit(1)
    if (!tag) {
      const [newTag] = await db.insert(journalTags).values({ name, slug }).returning()
      tag = newTag
    }
    tagIds.push(tag.id)
  }
  console.log(`🏷️  ${tagIds.length} tags resolved.`)

  const coverImageUrl = "/images/quiet-luxury-aesthetic-nepal.jpg"

  const blocks = [
    // ── INTRO ────────────────────────────────────────────────────────────────
    {
      id: "b_intro_1",
      type: "paragraph",
      data: {
        text: "There is a kind of dressing that asks nothing of anyone. No visible logos. No trend-of-the-month silhouette. No desire to impress through volume or colour or noise.<br/><br/>It simply looks <strong>expensive, effortless, and entirely considered</strong>.<br/><br/>This is the <strong>quiet luxury aesthetic</strong> — and it has quietly taken over global fashion conversation. If you have noticed certain outfits that look impeccably polished without a single obvious brand name, that is quiet luxury at work.<br/><br/>This guide breaks down what quiet luxury actually means, why it resonates so deeply right now, and exactly how to build this aesthetic into your wardrobe in Nepal — without spending a fortune.",
      },
    },

    // ── WHAT IS ──────────────────────────────────────────────────────────────
    {
      id: "b_h2_what",
      type: "heading",
      data: { level: 2, text: "What Is the Quiet Luxury Aesthetic?" },
    },
    {
      id: "b_p_what",
      type: "paragraph",
      data: {
        text: "Quiet luxury — also called the \"old money aesthetic\" — is a fashion philosophy built around restraint, quality, and timelessness.<br/><br/>It sits in direct opposition to \"loud luxury\": the streetwear-influenced, logo-heavy, trend-driven fashion that dominated the 2010s. Where loud luxury announces itself immediately, quiet luxury reveals itself slowly — through the quality of fabric, the precision of cut, the subtlety of fit.<br/><br/>The reference points are the old-money families of New England and Europe — people who do not need to prove their wealth through what they wear because the quality speaks for itself. The HBO series <em>Succession</em> brought this aesthetic to mainstream consciousness. Every character dressed in perfectly fitted, logo-free, expensive-looking clothing — and it became one of the most discussed fashion moments of recent years.<br/><br/>But quiet luxury is not about wealth. It is about <strong>intentionality</strong>. It is about choosing fewer, better things and wearing them with complete confidence.",
      },
    },
    {
      id: "b_callout_def",
      type: "callout",
      data: {
        title: "The Quiet Luxury Philosophy",
        text: "Quiet luxury says: the quality should be obvious, but the effort should be invisible. Your clothes should look like you simply reached into your wardrobe and put on exactly the right thing without thinking about it.",
        type: "info",
      },
    },

    // ── WHY IT'S TRENDING ────────────────────────────────────────────────────
    {
      id: "b_h2_why",
      type: "heading",
      data: { level: 2, text: "Why Quiet Luxury Is Trending Right Now" },
    },
    {
      id: "b_p_why",
      type: "paragraph",
      data: {
        text: "The rise of quiet luxury is not accidental. It is a direct reaction to several cultural shifts happening simultaneously.<br/><br/><strong>Fast fashion fatigue.</strong> An entire generation has grown up buying cheap, disposable clothing and watching it fall apart in two washes. The appeal of investing in something that actually lasts — and looks better for it — has never been stronger.<br/><br/><strong>Social media oversaturation.</strong> When everyone is trying to out-loud everyone else on Instagram and TikTok, the most radical thing you can do is dress with complete restraint. Quiet luxury is, paradoxically, a very visible statement precisely because it refuses to shout.<br/><br/><strong>Economic consciousness.</strong> \"Cost per wear\" thinking has become mainstream. Younger consumers are calculating that a single quality piece worn hundreds of times is a smarter investment than 30 cheap pieces worn twice each.<br/><br/><strong>A desire for timelessness.</strong> Trend cycles now move so fast that something can feel dated within months. Quiet luxury explicitly rejects trend cycles — the pieces look the same and work the same regardless of what season it is.",
      },
    },
    {
      id: "b_img_cover",
      type: "image",
      data: {
        urls: [coverImageUrl],
        caption: "Quiet luxury is defined by impeccable fit, neutral tones, and the complete absence of visible logos or unnecessary detail.",
        alt: "Young South Asian woman in a camel cashmere coat and tailored trousers — quiet luxury aesthetic",
      },
    },

    // ── THE COLOUR PALETTE ───────────────────────────────────────────────────
    {
      id: "b_h2_palette",
      type: "heading",
      data: { level: 2, text: "The Quiet Luxury Colour Palette" },
    },
    {
      id: "b_p_palette",
      type: "paragraph",
      data: {
        text: "Nothing signals quiet luxury faster than the right colour palette. This is an aesthetic built almost entirely on neutrals — but not boring ones.<br/><br/><strong>The core quiet luxury palette:</strong><br/>• <strong>Camel and tan</strong> — the signature colour of the aesthetic. Warm, rich, and effortlessly sophisticated.<br/>• <strong>Cream and off-white</strong> — softer and more interesting than bright white. Particularly beautiful in silk and cashmere.<br/>• <strong>Chocolate brown and dark tan</strong> — rich, grounded, unexpected in the best way.<br/>• <strong>Navy</strong> — the most elegant alternative to black. Particularly strong in tailoring.<br/>• <strong>Soft grey and charcoal</strong> — understated but impactful in structured pieces.<br/>• <strong>Black</strong> — used as an accent rather than the entire outfit.<br/><br/><strong>What to avoid:</strong> Bright neons, fast-fashion colourways (electric blue, fluorescent pink), and any colour chosen specifically because it was trending this season.<br/><br/>The goal is a palette where every piece naturally works with every other piece. Open your wardrobe and everything should coordinate effortlessly.",
      },
    },

    // ── KEY PIECES ───────────────────────────────────────────────────────────
    {
      id: "b_h2_pieces",
      type: "heading",
      data: { level: 2, text: "The Core Pieces of a Quiet Luxury Wardrobe" },
    },
    {
      id: "b_p_pieces",
      type: "paragraph",
      data: {
        text: "Quiet luxury is built on a very specific set of wardrobe pieces — each chosen for its versatility, its quality, and its refusal to go out of style.<br/><br/><strong>1. A Perfectly Fitted Blazer</strong><br/>The single most important piece in a quiet luxury wardrobe. Choose camel, charcoal grey, navy, or black. The fit must be precise — not too big, not too structured. A blazer in one of these tones can be paired with jeans for a casual look, with tailored trousers for a polished one, or over a silk dress for an evening occasion.<br/><br/><strong>2. Tailored Wide-Leg or Straight-Leg Trousers</strong><br/>The trouser silhouette of quiet luxury is clean and long. Avoid overly cropped lengths, embellishments, or obvious brand details. High-waisted, well-pressed, and in a neutral shade — these work with almost everything.<br/><br/><strong>3. A Silk or Satin Blouse</strong><br/>The luxury is in the fabric. A simple, unadorned silk blouse in cream, ivory, or camel looks effortlessly expensive. Wear it tucked into trousers, loosely over a skirt, or half-tucked for a relaxed but considered effect.<br/><br/><strong>4. Quality Knitwear</strong><br/>A well-made knit in cashmere, merino wool, or a quality blend is a quiet luxury staple. Look for clean, minimal constructions — a fitted turtleneck, a simple crewneck, a relaxed v-neck — in camel, cream, grey, or navy.<br/><br/><strong>5. A Structured Coat</strong><br/>For Kathmandu winters, a structured coat in camel or charcoal becomes the defining outer layer of an entire outfit. The coat <em>is</em> the statement — everything underneath should be equally refined but understated.",
      },
    },
    {
      id: "b_callout_fit",
      type: "callout",
      data: {
        title: "The Fit Rule",
        text: "In quiet luxury, fit is everything. A moderately priced piece that fits you perfectly will always look more expensive than an expensive piece that fits poorly. If needed, spend money on a tailor — the transformation is remarkable.",
        type: "info",
      },
    },

    // ── FABRICS ──────────────────────────────────────────────────────────────
    {
      id: "b_h2_fabrics",
      type: "heading",
      data: { level: 2, text: "Fabrics: Where Quiet Luxury Is Made or Broken" },
    },
    {
      id: "b_p_fabrics",
      type: "paragraph",
      data: {
        text: "You cannot build a quiet luxury wardrobe from synthetic fabrics. The entire aesthetic depends on how the material drapes, moves, and feels — and cheap synthetics give themselves away immediately.<br/><br/><strong>Quiet luxury fabrics to look for:</strong><br/>• <strong>Silk and satin</strong> — for blouses, skirts, and dresses. Luminous and fluid without trying to be.<br/>• <strong>Cashmere and merino wool</strong> — for knitwear. Particularly relevant for Kathmandu winters where quality warmth matters.<br/>• <strong>Linen</strong> — for warm weather. Beautifully textured and gets better with wear.<br/>• <strong>High-quality cotton</strong> — for shirts and basics. Look for twill or poplin weaves with weight to them.<br/>• <strong>Leather and suede</strong> — for bags, belts, and shoes. Even a small leather piece elevates an entire look.<br/><br/><strong>What to avoid:</strong> Cheap polyester that pills quickly, synthetic blends that lose shape after washing, anything with obvious fast-fashion construction (visible thread tension, thin lining, poorly finished seams).",
      },
    },

    // ── ACCESSORIES ──────────────────────────────────────────────────────────
    {
      id: "b_h2_accessories",
      type: "heading",
      data: { level: 2, text: "Accessories in a Quiet Luxury Wardrobe" },
    },
    {
      id: "b_p_accessories",
      type: "paragraph",
      data: {
        text: "Accessories in quiet luxury are chosen for understated impact. The rule is: every accessory should look intentional, high quality, and absolutely unforced.<br/><br/><strong>Bags:</strong> A structured leather bag in tan, black, or camel is the most consistent quiet luxury accessory. No visible logos. Clean construction. A size that is genuinely useful rather than performatively oversized or miniaturised.<br/><br/><strong>Shoes:</strong> Simple loafers in black or tan leather. Pointed or almond-toe flats. Clean white leather trainers. Block-heeled boots in brown or black. The quieter, the better.<br/><br/><strong>Jewellery:</strong> Delicate and consistent. A thin gold chain, small hoop earrings, a minimal watch, one or two fine rings. Nothing should clang, flash, or fight for attention. The jewellery should only be noticeable when someone is close enough to appreciate it.<br/><br/><strong>Scarves:</strong> A silk scarf in a muted print worn loosely at the neck or tied to a bag is one of the most classically quiet luxury accessories you can own.",
      },
    },

    // ── QUIET LUXURY IN NEPAL ────────────────────────────────────────────────
    {
      id: "b_h2_nepal",
      type: "heading",
      data: { level: 2, text: "How to Build the Quiet Luxury Aesthetic in Nepal" },
    },
    {
      id: "b_p_nepal",
      type: "paragraph",
      data: {
        text: "The quiet luxury aesthetic translates beautifully to a Nepali context — arguably more naturally than in many Western markets — because Nepal already has a deep tradition of valuing craft, quality fabric, and understated elegance.<br/><br/><strong>Work with local quality.</strong> Nepal produces some of the finest pashmina in the world. A genuine, high-quality pashmina shawl in a neutral tone is the single most \"quiet luxury\" piece you can wear — it is made from extraordinary material, it lasts for decades, and it is impossible to fake convincingly.<br/><br/><strong>Invest in well-constructed ethnic pieces.</strong> A beautifully made silk kurta in a neutral shade — cream, dusty rose, muted gold, or soft grey — is entirely consistent with quiet luxury values. The fabric quality and cut do the work. You do not need embellishment if the silhouette and material are right.<br/><br/><strong>Look for tailoring, not trend pieces.</strong> Kathmandu has excellent tailors who can construct pieces in quality fabrics at a fraction of what comparable garments would cost elsewhere. A tailored silk blouse or perfectly cut blazer made locally can be genuinely indistinguishable from much more expensive international alternatives.",
      },
    },
    {
      id: "b_callout_nepal",
      type: "callout",
      data: {
        title: "Nepal's Quiet Luxury Advantage",
        text: "Genuine Nepali pashmina is one of the finest luxury fibres in the world. Owning a single high-quality pashmina in camel, cream, or grey is the most authentically \"quiet luxury\" thing you can do — and it connects to something genuinely Nepali rather than imitating a Western aesthetic.",
        type: "info",
      },
    },

    // ── COMMON MISTAKES ──────────────────────────────────────────────────────
    {
      id: "b_h2_mistakes",
      type: "heading",
      data: { level: 2, text: "Common Quiet Luxury Mistakes to Avoid" },
    },
    {
      id: "b_p_mistakes",
      type: "paragraph",
      data: {
        text: "Because quiet luxury looks so simple, people often underestimate how intentional it actually is. These are the most common mistakes:<br/><br/><strong>Buying cheap basics and expecting them to look expensive.</strong> The entire premise of quiet luxury is quality — if the fabric is obviously synthetic, the stitching is loose, or the cut is shapeless, no amount of neutral colour will save it. Fewer pieces, better quality.<br/><br/><strong>Going completely logo-free but ignoring fit.</strong> Fit is the most visible signal of quality. A piece that fits you perfectly with no visible brand name will always read as more expensive than a luxury branded piece that fits poorly.<br/><br/><strong>Buying everything in beige and calling it quiet luxury.</strong> Quiet luxury is not about wearing a single colour. It is about wearing your chosen palette with confidence and conviction. Navy, charcoal, chocolate brown, and forest green are all quiet luxury colours.<br/><br/><strong>Confusing quiet luxury with quiet boring.</strong> The aesthetic is not minimalist in a sterile or joyless way. It is deeply considered. Each piece should feel like it was chosen with complete awareness — not just defaulted to because it was safe.",
      },
    },

    // ── OUTFIT FORMULAS ──────────────────────────────────────────────────────
    {
      id: "b_h2_formulas",
      type: "heading",
      data: { level: 2, text: "5 Quiet Luxury Outfit Formulas That Always Work" },
    },
    {
      id: "b_p_formulas",
      type: "paragraph",
      data: {
        text: "These are reliable combinations that consistently hit the quiet luxury note:<br/><br/><strong>1. The Tonal Neutral</strong><br/>Camel coat + cream blouse + dark navy trousers + tan loafers. Different neutrals, one quietly powerful look.<br/><br/><strong>2. The Monochrome Moment</strong><br/>All-camel or all-cream — coat, knit, and trousers in the same tone. Shoes one shade darker. One piece of delicate gold jewellery.<br/><br/><strong>3. The Relaxed Refinement</strong><br/>White or cream linen shirt (slightly oversized, tucked at front only) + tailored straight-leg trousers + simple white trainers + structured bag. Effortless but completely considered.<br/><br/><strong>4. The Silk and Wool Combination</strong><br/>A silk blouse in cream or dusty pink + high-quality grey or camel wool trousers + leather loafers + delicate gold earrings. The fabric contrast does all the work.<br/><br/><strong>5. The Nepal Edit</strong><br/>A beautifully cut silk kurta in ivory or muted gold + tailored palazzo pants + simple leather sandals + a genuine pashmina draped loosely + one set of fine gold jewellery. Quiet luxury with complete cultural authenticity.",
      },
    },

    // ── CONCLUSION ───────────────────────────────────────────────────────────
    {
      id: "b_h2_conclusion",
      type: "heading",
      data: { level: 2, text: "Quiet Luxury Is a Mindset, Not a Price Tag" },
    },
    {
      id: "b_p_conclusion",
      type: "paragraph",
      data: {
        text: "The most important thing to understand about the quiet luxury aesthetic is that it is not actually about money. It is about a particular relationship with clothing — one built on intention, quality, and self-assurance.<br/><br/>You do not need a wardrobe full of designer pieces to dress quietly luxuriously. You need a few carefully chosen pieces in quality fabrics that fit you well, work together seamlessly, and feel genuinely like you.<br/><br/>Start where you are. Audit your wardrobe for the pieces that already fit this definition. Build from there, slowly and intentionally. Let the quality speak for itself — because that, ultimately, is exactly what quiet luxury does.",
      },
    },
    {
      id: "b_quote_1",
      type: "quote",
      data: {
        text: "Elegance is not about being noticed, it is about being remembered.",
        caption: "Giorgio Armani",
      },
    },

    // ── DIVIDER + FAQs ───────────────────────────────────────────────────────
    { id: "b_divider_1", type: "divider", data: {} },
    {
      id: "b_faq_1",
      type: "faq",
      data: {
        question: "What is the quiet luxury aesthetic?",
        answer: "Quiet luxury is a fashion philosophy centred on high-quality fabrics, precise tailoring, neutral colour palettes, and the complete absence of visible logos. It is sometimes called the 'old money aesthetic'. The goal is to look effortlessly expensive and polished without any obvious signs of trying.",
      },
    },
    {
      id: "b_faq_2",
      type: "faq",
      data: {
        question: "What colours are used in quiet luxury fashion?",
        answer: "The quiet luxury palette is built on neutrals: camel, tan, cream, off-white, chocolate brown, navy, charcoal grey, and soft black. These colours naturally work together and create an understated, cohesive look without relying on bold or trend-driven hues.",
      },
    },
    {
      id: "b_faq_3",
      type: "faq",
      data: {
        question: "What is the difference between quiet luxury and minimalism?",
        answer: "Minimalism is primarily about owning and wearing as few things as possible. Quiet luxury is about wearing the right things — chosen specifically for their quality, fit, and timelessness. Quiet luxury can include a beautifully made silk blouse, a structured coat, and fine jewellery; it simply refuses to shout about them.",
      },
    },
    {
      id: "b_faq_4",
      type: "faq",
      data: {
        question: "Can I do quiet luxury on a budget in Nepal?",
        answer: "Yes. The most budget-friendly approach is to invest in quality where it matters most (one excellent blazer, a quality silk or cotton blouse, a genuine pashmina) and build slowly. Kathmandu's local tailors can create beautifully cut pieces in quality fabrics at accessible prices — a tailored fit is the biggest luxury signal of all.",
      },
    },
    {
      id: "b_faq_5",
      type: "faq",
      data: {
        question: "What fabrics define quiet luxury?",
        answer: "Silk, cashmere, merino wool, linen, high-quality cotton, and leather are the foundation fabrics of quiet luxury. These materials drape and feel distinctly different from cheaper synthetics — and that difference is exactly what the aesthetic communicates.",
      },
    },
    {
      id: "b_faq_6",
      type: "faq",
      data: {
        question: "Is the old money aesthetic the same as quiet luxury?",
        answer: "They are very closely related. 'Old money aesthetic' references the styling of generational wealth — understated, logo-free, quality-focused, and completely confident. 'Quiet luxury' is the broader fashion movement inspired by this. They share the same core values: quality over branding, timelessness over trends, fit over volume.",
      },
    },
  ]

  const postSlug = "quiet-luxury-aesthetic-nepal"
  const postData = {
    slug: postSlug,
    title: "The Quiet Luxury Aesthetic: How to Dress Like Old Money in Nepal",
    excerpt: "No logos. No noise. Just impeccable quality, precise tailoring, and effortless elegance. Here is how to build the quiet luxury aesthetic in Nepal.",
    body: blocks,
    coverImage: coverImageUrl,
    gallery: [coverImageUrl],
    authorId: adminUser.id,
    categoryId: category.id,
    workflowState: "PUBLISHED",
    visibility: "PUBLIC",
    isFeatured: true,
    isPinned: false,
    allowComments: true,
    readingTimeOverride: 10,
    locale: "en",
    seoTitle: "Quiet Luxury Aesthetic in Nepal: How to Dress Like Old Money",
    metaDescription: "Discover the quiet luxury aesthetic and how to build it in Nepal. Covers colour palettes, key pieces, fabrics, accessories, outfit formulas, and Nepal-specific styling tips.",
    canonicalUrl: `/journal/${postSlug}`,
    ogTitle: "The Quiet Luxury Aesthetic: How to Dress Like Old Money in Nepal",
    ogDescription: "No logos. No noise. Just impeccable quality and effortless elegance. How to build the quiet luxury aesthetic in Nepal.",
    ogImage: coverImageUrl,
    twitterTitle: "The Quiet Luxury Aesthetic in Nepal",
    twitterDescription: "No logos, no noise — just impeccable quality. How to build the quiet luxury old money aesthetic in Nepal.",
    twitterImage: coverImageUrl,
    robotsIndex: true,
    robotsFollow: true,
    focusKeyword: "quiet luxury aesthetic Nepal",
    publishedAt: new Date(),
    updatedAt: new Date(),
  }

  // Upsert
  const [existing] = await db.select().from(journalPosts).where(eq(journalPosts.slug, postSlug)).limit(1)
  let savedPost: any
  if (existing) {
    console.log(`🔄 Updating existing post (${existing.id})...`)
    const [updated] = await db.update(journalPosts).set(postData).where(eq(journalPosts.id, existing.id)).returning()
    savedPost = updated
  } else {
    console.log("✨ Creating new post...")
    const [inserted] = await db.insert(journalPosts).values(postData).returning()
    savedPost = inserted
  }

  // Tags
  await db.delete(journalPostTags).where(eq(journalPostTags.postId, savedPost.id))
  for (const tagId of tagIds) {
    await db.insert(journalPostTags).values({ postId: savedPost.id, tagId }).onConflictDoNothing()
  }

  // Revision
  await db.insert(journalRevisions).values({
    postId: savedPost.id,
    revisionData: postData,
    changedById: adminUser.id,
  })

  console.log(`\n🎉 Quiet Luxury Article Successfully Published!`)
  console.log(`📄 ID:    ${savedPost.id}`)
  console.log(`🔗 URL:   /journal/${savedPost.slug}`)
  console.log(`📊 State: ${savedPost.workflowState}`)
  console.log(`🏷️  Tags:  ${tagNames.join(", ")}`)
  console.log(`⏱️  Read:  ${postData.readingTimeOverride} min`)

  await sql.end()
}

importQuietLuxury().catch((err) => {
  console.error("❌ Import failed:", err)
  process.exit(1)
})
