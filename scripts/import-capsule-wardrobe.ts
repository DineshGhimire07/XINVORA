// scripts/import-capsule-wardrobe.ts
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

async function importCapsuleWardrobe() {
  console.log("🚀 Starting Capsule Wardrobe Content Import...")

  // 1. Get admin author
  const [adminUser] = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1)
  if (!adminUser) throw new Error("No admin user found.")
  console.log(`👤 Author: ${adminUser.firstName} ${adminUser.lastName}`)

  // 2. Ensure "Styling Guides" category exists
  let [category] = await db.select().from(journalCategories).where(eq(journalCategories.slug, "styling-guides")).limit(1)
  if (!category) {
    const [newCat] = await db.insert(journalCategories).values({
      name: "Styling Guides",
      slug: "styling-guides",
      description: "Editorial guides and advice on styling, outfits, and building your personal wardrobe.",
    }).returning()
    category = newCat
    console.log(`✅ Created category: ${category.name}`)
  } else {
    console.log(`📁 Category: ${category.name}`)
  }

  // 3. Tags
  const tagNames = [
    "capsule wardrobe",
    "wardrobe essentials",
    "slow fashion",
    "outfit ideas",
    "women's fashion",
    "minimalist fashion",
    "Nepal fashion",
    "sustainable fashion",
    "styling tips",
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

  // 4. Full article body blocks
  const coverImageUrl = "/images/capsule-wardrobe-women-nepal.jpg"

  const blocks = [
    // ── INTRO ──────────────────────────────────────────────────────────────
    {
      id: "b_intro_1",
      type: "paragraph",
      data: {
        text: "Most people open their wardrobe, look at a full rail of clothes, and still feel like they have nothing to wear.<br/><br/>This is not a problem of having too few clothes. It is a problem of having the <strong>wrong combination of clothes</strong>.<br/><br/>A <strong>capsule wardrobe</strong> solves this. Instead of a closet full of random pieces that rarely work together, you build a smaller, intentional collection where almost every item can be combined with everything else. The result is more outfit options, less decision fatigue, and a wardrobe that actually makes sense.<br/><br/>This guide explains what a capsule wardrobe is, why it works, and exactly how to build one — with practical advice for women in Nepal."
      }
    },

    // ── WHAT IS ────────────────────────────────────────────────────────────
    {
      id: "b_h2_what",
      type: "heading",
      data: { level: 2, text: "What Is a Capsule Wardrobe?" }
    },
    {
      id: "b_p_what",
      type: "paragraph",
      data: {
        text: "A capsule wardrobe is a curated collection of versatile clothing pieces that work together seamlessly. The concept was popularized by London boutique owner Susie Faux in the 1970s and later refined by designer Donna Karan, but it has never been more relevant than it is today.<br/><br/>The idea is simple: instead of buying constantly and impulsively, you invest in a smaller number of high-quality, timeless pieces that mix and match easily. A typical capsule wardrobe contains <strong>25 to 40 items</strong> — including clothing, shoes, and bags — that cover your everyday needs.<br/><br/>Every piece in a capsule wardrobe earns its place. If it does not work with at least three other items you own, it probably does not belong in your capsule."
      }
    },
    {
      id: "b_callout_why",
      type: "callout",
      data: {
        title: "The Core Idea",
        text: "10 well-chosen pieces can create 30+ outfits. 50 random pieces often create nothing wearable at all. Quality and compatibility always beat quantity.",
        type: "info"
      }
    },

    // ── WHY IT WORKS ───────────────────────────────────────────────────────
    {
      id: "b_h2_why",
      type: "heading",
      data: { level: 2, text: "Why a Capsule Wardrobe Actually Works" }
    },
    {
      id: "b_p_why",
      type: "paragraph",
      data: {
        text: "The capsule wardrobe approach works for several practical reasons:<br/><br/><strong>It saves money over time.</strong> Buying fewer, better pieces costs more upfront but significantly less over years. A quality top worn 200 times is far cheaper per wear than a cheap one worn 5 times before it falls apart.<br/><br/><strong>It saves time every morning.</strong> When every item in your wardrobe works together, getting dressed becomes easy. You stop standing in front of a full closet feeling overwhelmed.<br/><br/><strong>It reduces waste.</strong> Fast fashion is one of the most polluting industries in the world. Building a capsule wardrobe means buying less, wasting less, and consuming more responsibly.<br/><br/><strong>It develops your personal style.</strong> When you stop buying impulsively and start choosing intentionally, you discover what you actually like — and your outfits start to feel more like you."
      }
    },
    {
      id: "b_img_cover",
      type: "image",
      data: {
        urls: [coverImageUrl],
        caption: "A capsule wardrobe is built from versatile, high-quality pieces that work together effortlessly.",
        alt: "A flat lay of capsule wardrobe essentials including a white shirt, camel blazer, dark jeans, and accessories"
      }
    },

    // ── STEP 1: AUDIT ──────────────────────────────────────────────────────
    {
      id: "b_h2_s1",
      type: "heading",
      data: { level: 2, text: "Step 1: Audit What You Already Own" }
    },
    {
      id: "b_p_s1",
      type: "paragraph",
      data: {
        text: "Before buying anything, take everything out of your wardrobe and assess it honestly.<br/><br/>For each item, ask:<br/>• Have I worn this in the last six months?<br/>• Does it fit well right now?<br/>• Do I feel good when I wear it?<br/>• Does it work with at least three other things I own?<br/><br/>If the answer to most of these is no, that item is not part of your capsule. Set it aside to donate, sell, or pass on.<br/><br/>This step can feel uncomfortable — especially if you realize you spent money on things you never actually wore. But it is the most important step. You cannot build a coherent capsule on top of a cluttered foundation."
      }
    },
    {
      id: "b_callout_audit",
      type: "callout",
      data: {
        title: "Honest Audit Rule",
        text: "If it doesn't fit, doesn't make you feel good, or hasn't been worn in six months — it doesn't belong in your capsule. Let it go.",
        type: "info"
      }
    },

    // ── STEP 2: COLOUR PALETTE ─────────────────────────────────────────────
    {
      id: "b_h2_s2",
      type: "heading",
      data: { level: 2, text: "Step 2: Choose Your Colour Palette" }
    },
    {
      id: "b_p_s2",
      type: "paragraph",
      data: {
        text: "A cohesive colour palette is what makes a capsule wardrobe actually function. Without it, even good individual pieces will not mix and match well.<br/><br/><strong>Start with neutrals as your foundation:</strong><br/>• Black<br/>• White or off-white<br/>• Navy or dark blue<br/>• Camel or tan<br/>• Grey<br/>• Beige or cream<br/><br/>These colours naturally work together. A black trouser goes with a white shirt, a camel blazer, a beige knit — everything.<br/><br/><strong>Then add 1 or 2 accent colours</strong> that reflect your personality. This could be a deep burgundy, a warm terracotta, a sage green, or a dusty rose — whatever feels like you.<br/><br/>The goal is not a boring, colourless wardrobe. It is a wardrobe where every piece you reach for works with what you already have on."
      }
    },

    // ── STEP 3: BUILD THE FOUNDATION ───────────────────────────────────────
    {
      id: "b_h2_s3",
      type: "heading",
      data: { level: 2, text: "Step 3: Build Your Foundation Pieces" }
    },
    {
      id: "b_p_s3a",
      type: "paragraph",
      data: {
        text: "Foundation pieces are the backbone of your capsule wardrobe. These are the basics you reach for constantly — they are not exciting on their own, but they make everything else work.<br/><br/><strong>Essential Tops:</strong><br/>• 2–3 plain white or cream T-shirts (good quality, clean fit)<br/>• 1–2 fitted or relaxed cotton tops in neutral colours<br/>• 1 classic white button-down shirt<br/>• 1 knit or sweater in a neutral shade<br/>• 1 fitted turtleneck for colder months<br/><br/><strong>Essential Bottoms:</strong><br/>• 1–2 pairs of dark wash straight-leg jeans<br/>• 1 pair of tailored black trousers<br/>• 1 midi skirt in a neutral or accent colour<br/><br/><strong>Essential Dresses:</strong><br/>• 1 simple midi dress (can dress up or down)<br/>• 1 casual day dress for warmer weather<br/><br/><strong>Essential Outerwear:</strong><br/>• 1 structured blazer (black, camel, or grey)<br/>• 1 light jacket or trench coat for transitional weather<br/>• 1 warmer layer for Kathmandu winters"
      }
    },
    {
      id: "b_callout_quality",
      type: "callout",
      data: {
        title: "Quality Over Quantity",
        text: "Foundation pieces should be the highest quality you can afford. These are the items you will wear hundreds of times. Spending more here saves money in the long run — and these pieces simply look and feel better.",
        type: "info"
      }
    },

    // ── STEP 4: SHOES & BAGS ───────────────────────────────────────────────
    {
      id: "b_h2_s4",
      type: "heading",
      data: { level: 2, text: "Step 4: Add Your Shoes and Bags" }
    },
    {
      id: "b_p_s4",
      type: "paragraph",
      data: {
        text: "Shoes and bags can make or break a capsule wardrobe. Too many mismatched options create chaos; a few versatile pieces create cohesion.<br/><br/><strong>Capsule Shoes (4–5 pairs):</strong><br/>• Clean white leather sneakers — the most versatile shoe you can own<br/>• Simple black flats or pointed-toe flats<br/>• Low-heeled sandals or strappy sandals in a neutral<br/>• Ankle boots or block-heeled boots for cooler weather<br/>• One pair of simple heels for occasions<br/><br/><strong>Capsule Bags (2–3 bags):</strong><br/>• One structured everyday bag in tan, black, or cream<br/>• One smaller crossbody or shoulder bag for lighter days<br/>• One simple evening bag for special occasions<br/><br/>Neutral-toned bags work with the widest range of outfits. A tan leather bag, in particular, goes with almost anything and adds warmth to a neutral palette."
      }
    },

    // ── STEP 5: ACCESSORIES ────────────────────────────────────────────────
    {
      id: "b_h2_s5",
      type: "heading",
      data: { level: 2, text: "Step 5: Choose Simple, Versatile Accessories" }
    },
    {
      id: "b_p_s5",
      type: "paragraph",
      data: {
        text: "Accessories are where you inject personality into a capsule wardrobe without disrupting its cohesion.<br/><br/><strong>Jewellery:</strong><br/>• A set of delicate gold or silver hoops<br/>• Simple stud earrings in the same metal<br/>• A thin chain necklace<br/>• One or two minimal rings or bangles<br/><br/><strong>Other accessories:</strong><br/>• One or two silk or cotton scarves (incredibly versatile — worn on the neck, hair, or bag)<br/>• A simple leather belt in a neutral colour<br/>• A minimal watch<br/><br/>The rule with accessories in a capsule wardrobe: keep the base jewellery simple and consistent, then add one statement piece when you want. This is much more intentional than a tangled jewellery box full of mismatched pieces you never wear."
      }
    },

    // ── NEPAL SPECIFIC ─────────────────────────────────────────────────────
    {
      id: "b_h2_nepal",
      type: "heading",
      data: { level: 2, text: "Building a Capsule Wardrobe in Nepal: What to Consider" }
    },
    {
      id: "b_p_nepal",
      type: "paragraph",
      data: {
        text: "A capsule wardrobe for women in Nepal needs to account for a few things that standard international guides tend to overlook.<br/><br/><strong>Nepal's climate changes significantly.</strong> Kathmandu summers are warm and often humid; winters can be genuinely cold, especially indoors where central heating is rare. Your capsule needs layering pieces that work across seasons — light cottons for summer, knits and blazers for winter, and transitional layers for the unpredictable months in between.<br/><br/><strong>Occasion range is wide.</strong> A typical week might include office or college, casual social plans, family gatherings, and festival visits. Your capsule should cover this range without needing a completely different wardrobe for each context. A structured blazer over jeans can work for college and a dinner. A midi dress can work for both a family gathering and an evening with friends.<br/><br/><strong>Cultural occasions matter.</strong> Rather than trying to capsule everything into Western basics, include one or two well-chosen ethnic pieces. A quality kurta set and a simple dupatta can do a lot across different occasions. The key is choosing pieces in your capsule's colour palette so they still integrate naturally."
      }
    },
    {
      id: "b_callout_nepal",
      type: "callout",
      data: {
        title: "Nepal Capsule Tip",
        text: "Include 1–2 quality ethnic pieces in your capsule — a well-cut kurta set or simple saree in a neutral or accent colour from your palette. This way your capsule covers both daily life and cultural occasions without needing a second wardrobe.",
        type: "info"
      }
    },

    // ── HOW MANY PIECES ────────────────────────────────────────────────────
    {
      id: "b_h2_howmany",
      type: "heading",
      data: { level: 2, text: "How Many Pieces Does a Capsule Wardrobe Need?" }
    },
    {
      id: "b_p_howmany",
      type: "paragraph",
      data: {
        text: "There is no magic number. Most guidelines suggest <strong>25 to 40 total items</strong> — including clothing, shoes, and bags — but this depends entirely on your lifestyle.<br/><br/>A student with a casual daily life might need fewer pieces than someone who moves between college, work, and social events regularly.<br/><br/>Rather than counting pieces, focus on this question: <strong>Can I dress for any situation I normally face using only what is in this wardrobe?</strong><br/><br/>If the answer is yes, your capsule is working. If there are regular occasions where you find yourself with nothing suitable, you have identified a genuine gap to fill — thoughtfully, not impulsively."
      }
    },

    // ── WHAT TO AVOID ──────────────────────────────────────────────────────
    {
      id: "b_h2_avoid",
      type: "heading",
      data: { level: 2, text: "What to Avoid When Building Your Capsule" }
    },
    {
      id: "b_p_avoid",
      type: "paragraph",
      data: {
        text: "Building a capsule wardrobe is as much about what you <em>do not</em> add as what you do.<br/><br/><strong>Avoid trend-driven pieces.</strong> Micro-trends come and go every season. A neon print top or an extremely exaggerated silhouette might feel exciting when you buy it, but it is often impossible to wear six months later. Stick to pieces with a longer style lifespan.<br/><br/><strong>Avoid buying duplicates to fill gaps quickly.</strong> If you identify a genuine gap — say, you need a good quality blazer — resist the urge to buy the first thing you find. Take time to find the right piece rather than settling.<br/><br/><strong>Avoid colours that do not work with your palette.</strong> Even if a top is beautiful, if it does not work with any of your existing bottoms, it will sit unworn. This is the most common mistake — buying individual pieces rather than thinking about the wardrobe as a system.<br/><br/><strong>Avoid over-occasion-ing your capsule.</strong> You do not need 20 party dresses or 15 casual tops. Be honest about how often you actually attend formal events versus how many days you spend in casual everyday clothes."
      }
    },

    // ── MAINTAINING ────────────────────────────────────────────────────────
    {
      id: "b_h2_maintain",
      type: "heading",
      data: { level: 2, text: "How to Maintain Your Capsule Wardrobe" }
    },
    {
      id: "b_p_maintain",
      type: "paragraph",
      data: {
        text: "A capsule wardrobe is not a one-time project. It is an ongoing practice of intentional curation.<br/><br/><strong>Review it every season.</strong> Kathmandu's four seasons are distinct enough to warrant a seasonal check-in. Put away pieces that do not suit the current weather, pull out what does, and assess whether anything needs replacing or updating.<br/><br/><strong>Use the one-in, one-out rule.</strong> Before adding any new piece to your capsule, remove one. This keeps the wardrobe from slowly expanding back into chaos.<br/><br/><strong>Invest in care.</strong> Quality pieces last far longer when cared for properly. Learn the right way to wash, store, and maintain different fabrics. A cashmere knit that is hand-washed and stored correctly can last a decade. One that is machine-washed on the wrong cycle may not survive a season."
      }
    },

    // ── GETTING STARTED ────────────────────────────────────────────────────
    {
      id: "b_h2_start",
      type: "heading",
      data: { level: 2, text: "Where to Start If You're Overwhelmed" }
    },
    {
      id: "b_p_start",
      type: "paragraph",
      data: {
        text: "If the idea of building a capsule wardrobe feels overwhelming, start smaller than you think you need to.<br/><br/>Begin with just <strong>one week of outfits</strong>. Pick 7 complete looks you already own that you love wearing. Look at what those outfits have in common — those are your personal capsule foundations.<br/><br/>Then, over the next few months, slowly fill genuine gaps with intentional purchases. You do not need to build your capsule in a single weekend. In fact, rushing it often means making the same impulsive mistakes that filled your closet in the first place.<br/><br/><strong>The goal is not a perfect wardrobe.</strong> It is a wardrobe that actually works for your real, everyday life — one where getting dressed feels easy rather than overwhelming."
      }
    },
    {
      id: "b_quote_1",
      type: "quote",
      data: {
        text: "Style is knowing who you are, what you want to say, and not giving a damn.",
        caption: "Orson Welles"
      }
    },

    // ── CONCLUSION ─────────────────────────────────────────────────────────
    {
      id: "b_h2_conclusion",
      type: "heading",
      data: { level: 2, text: "A Capsule Wardrobe Is About Dressing With Intention" }
    },
    {
      id: "b_p_conclusion",
      type: "paragraph",
      data: {
        text: "The capsule wardrobe approach is not about minimalism for its own sake. It is not about owning the least possible amount of clothing or following a strict set of rules.<br/><br/>It is about building a wardrobe where every piece serves you — where you open your closet and actually want to wear what is in it.<br/><br/>Start with what you already own. Choose a colour palette. Fill in genuine gaps with quality pieces. Maintain it with intention. Let it evolve as your life does.<br/><br/>A capsule wardrobe, done well, is one of the most practical style decisions you can make."
      }
    },

    // ── DIVIDER + FAQs ─────────────────────────────────────────────────────
    { id: "b_divider_1", type: "divider", data: {} },
    {
      id: "b_faq_1",
      type: "faq",
      data: {
        question: "What is a capsule wardrobe?",
        answer: "A capsule wardrobe is a small, curated collection of versatile clothing pieces that work together. The goal is to own fewer items but have more outfit combinations, with every piece earning its place."
      }
    },
    {
      id: "b_faq_2",
      type: "faq",
      data: {
        question: "How many pieces should a capsule wardrobe have?",
        answer: "Most guides suggest 25 to 40 items including clothing, shoes, and bags. But there is no strict rule — it depends entirely on your lifestyle and how many different occasions you dress for regularly."
      }
    },
    {
      id: "b_faq_3",
      type: "faq",
      data: {
        question: "What colours work best for a capsule wardrobe?",
        answer: "Start with neutrals like black, white, navy, camel, grey, and beige — these mix and match easily. Then add one or two accent colours that feel personal to you. A cohesive palette is what makes the system work."
      }
    },
    {
      id: "b_faq_4",
      type: "faq",
      data: {
        question: "Can a capsule wardrobe work for women in Nepal?",
        answer: "Absolutely. A capsule wardrobe for Nepal should account for the climate range (warm summers, cold winters), a wide range of occasions (college, office, social, family, festivals), and include one or two quality ethnic pieces like a kurta set that integrate with the rest of the wardrobe."
      }
    },
    {
      id: "b_faq_5",
      type: "faq",
      data: {
        question: "How do I start building a capsule wardrobe?",
        answer: "Start by auditing what you already own. Keep pieces you love, fit well, and actually wear. Choose a colour palette. Identify genuine gaps. Then fill those gaps slowly and intentionally — not all at once."
      }
    },
    {
      id: "b_faq_6",
      type: "faq",
      data: {
        question: "Is a capsule wardrobe the same as minimalism?",
        answer: "Not exactly. Minimalism is about owning as little as possible. A capsule wardrobe is about owning the right things — pieces that work together, suit your lifestyle, and that you genuinely love wearing. You can have a capsule wardrobe and still enjoy fashion."
      }
    }
  ]

  // 5. Post metadata
  const postSlug = "how-to-build-capsule-wardrobe-women-nepal"
  const postData = {
    slug: postSlug,
    title: "How to Build a Capsule Wardrobe: A Practical Guide for Women in Nepal",
    excerpt: "Stop buying more and start dressing better. Here is how to build a capsule wardrobe that actually works for your life, your climate, and your personal style.",
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
    readingTimeOverride: 8,
    locale: "en",
    seoTitle: "How to Build a Capsule Wardrobe for Women in Nepal (2025 Guide)",
    metaDescription: "Learn how to build a capsule wardrobe as a woman in Nepal. Step-by-step guide covering colour palettes, essential pieces, shoes, bags, accessories, and Nepal-specific styling tips.",
    canonicalUrl: `/journal/${postSlug}`,
    ogTitle: "How to Build a Capsule Wardrobe for Women in Nepal",
    ogDescription: "Stop buying more and start dressing better. A complete capsule wardrobe guide built for Nepali women — covering essentials, colour palettes, and real lifestyle advice.",
    ogImage: coverImageUrl,
    twitterTitle: "How to Build a Capsule Wardrobe for Women in Nepal",
    twitterDescription: "Stop buying more and start dressing better. A complete capsule wardrobe guide built for Nepali women.",
    twitterImage: coverImageUrl,
    robotsIndex: true,
    robotsFollow: true,
    focusKeyword: "capsule wardrobe for women",
    publishedAt: new Date(),
    updatedAt: new Date(),
  }

  // 6. Upsert post
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

  // 7. Link tags
  await db.delete(journalPostTags).where(eq(journalPostTags.postId, savedPost.id))
  for (const tagId of tagIds) {
    await db.insert(journalPostTags).values({ postId: savedPost.id, tagId }).onConflictDoNothing()
  }

  // 8. Save revision snapshot
  await db.insert(journalRevisions).values({
    postId: savedPost.id,
    revisionData: postData,
    changedById: adminUser.id,
  })

  console.log(`\n🎉 Capsule Wardrobe Article Successfully Published!`)
  console.log(`📄 ID:    ${savedPost.id}`)
  console.log(`🔗 URL:   /journal/${savedPost.slug}`)
  console.log(`📊 State: ${savedPost.workflowState}`)
  console.log(`🏷️  Tags:  ${tagNames.join(", ")}`)
  console.log(`⏱️  Read:  ${postData.readingTimeOverride} min`)

  await sql.end()
}

importCapsuleWardrobe().catch((err) => {
  console.error("❌ Import failed:", err)
  process.exit(1)
})
