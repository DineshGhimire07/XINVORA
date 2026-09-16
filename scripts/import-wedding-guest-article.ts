// scripts/import-wedding-guest-article.ts
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

async function importWeddingGuestArticle() {
  console.log("🚀 Starting Wedding Guest Outfit Article Import...")

  // 1. Get admin author
  const [adminUser] = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1)
  if (!adminUser) throw new Error("No admin user found.")
  console.log(`👤 Author: ${adminUser.firstName} ${adminUser.lastName}`)

  // 2. Ensure "Styling Guides" category exists
  let [category] = await db
    .select()
    .from(journalCategories)
    .where(eq(journalCategories.slug, "styling-guides"))
    .limit(1)

  if (!category) {
    const [newCat] = await db
      .insert(journalCategories)
      .values({
        name: "Styling Guides",
        slug: "styling-guides",
        description: "Editorial guides and advice on styling, outfits, and building your personal wardrobe.",
      })
      .returning()
    category = newCat
    console.log(`✅ Created category: ${category.name}`)
  } else {
    console.log(`📁 Category: ${category.name}`)
  }

  // 3. Tags
  const tagNames = [
    "Nepali wedding outfit",
    "wedding guest outfit",
    "what to wear to a wedding",
    "Nepal fashion",
    "ethnic wear",
    "kurta set",
    "saree styling",
    "women's fashion",
    "festive outfits",
    "occasion dressing",
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
  const coverImageUrl = "/images/what-to-wear-nepali-wedding-guest.jpg"

  const blocks = [
    // ── INTRO ───────────────────────────────────────────────────────────────
    {
      id: "b_intro_1",
      type: "paragraph",
      data: {
        text: "Getting an invitation to a Nepali wedding is one thing. Figuring out what to actually wear is another.<br/><br/>Nepali weddings are multi-day, multi-occasion events. There is the mehendi, the sagun, the wedding ceremony itself, and often a reception dinner the following evening. Each occasion has a slightly different dress code — and none of them are as simple as \"just wear something nice.\"<br/><br/>This guide covers exactly <strong>what to wear to a Nepali wedding as a guest</strong> — from the ceremony to the reception, from traditional to contemporary, and everything in between.",
      },
    },
    {
      id: "b_callout_rule1",
      type: "callout",
      data: {
        title: "Golden Rule for Nepali Wedding Guests",
        text: "Never wear white (reserved for mourning) or red (the bride's colour). Beyond that, the more celebratory your outfit, the better. This is not the occasion for understated basics.",
        type: "info",
      },
    },

    // ── WHAT MAKES NEPALI WEDDINGS DIFFERENT ────────────────────────────────
    {
      id: "b_h2_different",
      type: "heading",
      data: { level: 2, text: "What Makes Nepali Wedding Dress Codes Different" },
    },
    {
      id: "b_p_different",
      type: "paragraph",
      data: {
        text: "Nepali weddings are typically longer, louder, and more involved than a single-afternoon ceremony. Guests often attend multiple events over two or more days, which means you may need more than one outfit — or at least one outfit that can adapt across occasions.<br/><br/>The dress code also depends heavily on the community. A Brahmin or Chhetri wedding will have different customs than a Newari wedding, a Gurung wedding, or a ceremony held in Kathmandu versus a more traditional rural setting.<br/><br/>However, some general principles apply across most Nepali weddings:<br/>• Rich, festive colours are expected and appreciated<br/>• Ethnic and semi-ethnic wear is almost always appropriate<br/>• You should be able to sit, stand, eat, and dance comfortably<br/>• Modesty matters — especially at traditional ceremonies and for older guests",
      },
    },

    // ── SECTION 1: KURTA SETS ───────────────────────────────────────────────
    {
      id: "b_h2_kurta",
      type: "heading",
      data: { level: 2, text: "1. A Silk or Embellished Kurta Set: The Most Versatile Choice" },
    },
    {
      id: "b_p_kurta",
      type: "paragraph",
      data: {
        text: "For most women attending a Nepali wedding, a well-chosen kurta set is the most versatile and fail-safe option. It is ethnic enough to feel appropriate for the ceremony, comfortable enough to survive a long day, and flattering across a wide range of body types.<br/><br/><strong>What to look for:</strong><br/>• Rich fabric — silk, georgette, brocade, or a blend rather than cotton<br/>• An interesting cut — Anarkali flare, straight cut, asymmetric hem, or a contemporary A-line<br/>• Embellishment — embroidery, threadwork, gota patti, or mirror work that reads as celebratory without being overwhelming<br/>• A dupatta in a complementary or contrasting colour<br/><br/><strong>Best colours for a kurta set:</strong><br/>Maroon, emerald, royal blue, deep teal, mustard, magenta, burnt orange, plum, and champagne. Avoid white, cream, and red.",
      },
    },
    {
      id: "b_img_cover",
      type: "image",
      data: {
        urls: [coverImageUrl],
        caption: "A silk kurta set in a deep jewel tone with gold accents is one of the most reliable wedding guest choices.",
        alt: "Young woman in a burgundy silk kurta set at a Nepali wedding ceremony",
      },
    },

    // ── SECTION 2: SAREES ───────────────────────────────────────────────────
    {
      id: "b_h2_saree",
      type: "heading",
      data: { level: 2, text: "2. A Saree: The Classic and Always-Appropriate Option" },
    },
    {
      id: "b_p_saree",
      type: "paragraph",
      data: {
        text: "A saree never reads as wrong at a Nepali wedding. It is culturally familiar, inherently festive, and — when worn well — one of the most elegant options in the room.<br/><br/>The key is choosing the right fabric and colour for the occasion.<br/><br/><strong>For the wedding ceremony:</strong> Rich silk sarees, kanchipuram-style weaves, banarasi silk, or sarees with heavy borders work beautifully. Pair with a fitted blouse, gold jewellery, and heels or block sandals.<br/><br/><strong>For a reception or sangeet:</strong> Georgette, chiffon, or a lighter silk with beautiful draping is more appropriate. These fabrics allow more movement and are more comfortable for longer evenings.<br/><br/><strong>For a modern approach:</strong> Pre-stitched sarees and saree gowns are increasingly popular — they offer the look of a saree without the complexity of traditional draping, which makes them practical for guests who love the aesthetic but want more confidence moving through the day.",
      },
    },
    {
      id: "b_callout_saree",
      type: "callout",
      data: {
        title: "Saree Comfort Tip",
        text: "If you are not used to wearing a saree for long hours, practice draping it once before the wedding day. An unravelling saree is stressful — either practice, or choose a pre-stitched version for confidence.",
        type: "info",
      },
    },

    // ── SECTION 3: LEHENGA ──────────────────────────────────────────────────
    {
      id: "b_h2_lehenga",
      type: "heading",
      data: { level: 2, text: "3. A Lehenga Choli: For a More Formal or Glamorous Look" },
    },
    {
      id: "b_p_lehenga",
      type: "paragraph",
      data: {
        text: "A lehenga — a long skirt paired with a fitted choli top and dupatta — is one of the most glamorous options for a wedding guest. It is particularly popular for evening receptions and sangeet events where the atmosphere is more festive and fashion-forward.<br/><br/><strong>Choosing the right lehenga as a guest:</strong><br/>• Avoid heavily embellished, bridal-style lehengas in red or white — save those colours and styles for the bride<br/>• Look for beautiful embroidery or print in jewel tones, pastels, or rich neutrals<br/>• The skirt length matters — ankle-length is the most elegant; shorter lengths can work for younger guests at reception dinners<br/>• A simple, fitted choli with a beautiful back design makes for excellent photographs<br/><br/>A lehenga requires more dressing time and care than a kurta set, but if you want to make a genuinely strong impression at a wedding reception, few choices match it.",
      },
    },

    // ── SECTION 4: CONTEMPORARY FUSION ─────────────────────────────────────
    {
      id: "b_h2_fusion",
      type: "heading",
      data: { level: 2, text: "4. Contemporary Fusion: For Younger Guests and Modern Receptions" },
    },
    {
      id: "b_p_fusion",
      data: {
        text: "Not every Nepali wedding requires strictly traditional clothing — especially for younger guests, city weddings, or reception dinners that lean more toward a contemporary venue and vibe.<br/><br/><strong>Fusion options that work well:</strong><br/><br/><strong>Co-ord sets with ethnic accents:</strong> A matching top-and-skirt or trouser set in a rich fabric or print can feel festive without being strictly traditional. Pair with statement jewellery to bring in the celebratory element.<br/><br/><strong>Draped skirts:</strong> A floor-length draped skirt in silk, satin, or jacquard paired with a fitted crop top or blouse can look stunning for a reception dinner. Add traditional jewellery for the ethnic touch.<br/><br/><strong>A maxi dress in a rich colour:</strong> A well-chosen maxi dress in deep jewel tones with interesting construction or embellishment can absolutely work for a modern reception. This is especially appropriate for destination weddings or indoor receptions with a more international guest list.<br/><br/>The one rule for contemporary fusion at a Nepali wedding: your outfit needs to feel <strong>deliberate and festive</strong>. A simple casual dress, even a good one, reads as underdressed at most Nepali ceremonies.",
      },
      type: "paragraph",
    },

    // ── SECTION 5: WHAT NOT TO WEAR ────────────────────────────────────────
    {
      id: "b_h2_avoid",
      type: "heading",
      data: { level: 2, text: "5. What Not to Wear to a Nepali Wedding" },
    },
    {
      id: "b_p_avoid",
      type: "paragraph",
      data: {
        text: "Some choices that might seem fine can create unintentional problems at a Nepali wedding:<br/><br/><strong>White or cream:</strong> White is the colour of mourning in Hindu tradition. Wearing it to a wedding — even in a contemporary ivory or off-white tone — is generally considered inappropriate for Indian and Nepali weddings. Avoid it entirely.<br/><br/><strong>Red:</strong> Red is traditionally the bride's colour. Wearing a predominantly red outfit as a guest (especially to the ceremony) can feel like you are trying to compete with or overshadow the bride. Opt for maroon, burgundy, or rust tones if you want something in that family.<br/><br/><strong>Black alone:</strong> In many traditional Nepali families, wearing all-black to a wedding is considered inauspicious. If you love dark colours, pair black with gold jewellery and a colourful dupatta or accessory, or choose deep navy, forest green, or charcoal instead.<br/><br/><strong>Very casual clothing:</strong> Jeans, T-shirts, sneakers, or anything you would wear on a regular day out can feel disrespectful to the formality and significance of the occasion. Even younger guests should dress up noticeably.<br/><br/><strong>Overly revealing cuts:</strong> Very deep necklines, extremely short hemlines, or very backless garments can be uncomfortable in a mixed-generation family setting. Keep modesty in mind, particularly for the ceremony.",
      },
    },

    // ── SECTION 6: JEWELLERY ────────────────────────────────────────────────
    {
      id: "b_h2_jewellery",
      type: "heading",
      data: { level: 2, text: "6. Jewellery and Accessories for a Nepali Wedding" },
    },
    {
      id: "b_p_jewellery",
      type: "paragraph",
      data: {
        text: "Jewellery is not optional at a Nepali wedding — it is part of the look. The occasion calls for more than your everyday accessories.<br/><br/><strong>For a traditional or ethnic outfit:</strong><br/>Gold-toned jewellery is the most natural choice. Jhumka earrings, a delicate or layered necklace, bangles or a set of gold-toned kadas, and a simple ring or two. Keep the set cohesive rather than mixing too many different styles.<br/><br/><strong>For a contemporary or fusion outfit:</strong><br/>You have more flexibility. Silver or mixed-metal accessories can work, as can one statement piece — bold earrings, a chunky necklace, or a striking cuff — balanced against simpler choices elsewhere.<br/><br/><strong>Hair and finishing touches:</strong><br/>An updo or a side-swept style typically looks more wedding-appropriate than hair worn completely loose, though this is not a strict rule. A small floral hair accessory, a pin, or a maang tikka can add a beautiful traditional touch. A simple clutch or potli (a small embroidered drawstring bag) rounds out most ethnic looks perfectly.",
      },
    },
    {
      id: "b_callout_jewellery",
      type: "callout",
      data: {
        title: "Jewellery Rule of Thumb",
        text: "Choose one focal point — earrings OR necklace OR bangles — and let that lead. Wearing everything at maximum volume at once tends to look overwhelming rather than celebratory.",
        type: "info",
      },
    },

    // ── SECTION 7: FOOTWEAR ─────────────────────────────────────────────────
    {
      id: "b_h2_shoes",
      type: "heading",
      data: { level: 2, text: "7. Shoes: Practical Choices for a Long Day" },
    },
    {
      id: "b_p_shoes",
      type: "paragraph",
      data: {
        text: "Nepali weddings involve a lot of standing, sitting on the floor, moving between locations, and sometimes dancing. This makes comfortable footwear more important than you might expect.<br/><br/><strong>Best footwear choices:</strong><br/>• Block-heeled sandals — give the height of a heel with significantly more stability<br/>• Low kitten heels in gold, silver, or a neutral shade<br/>• Embellished flat sandals or kolhapuri-style flats for traditional outfits<br/>• Simple pointed flats for a contemporary look<br/><br/><strong>What to be careful of:</strong><br/>• Very high stiletto heels — difficult on uneven courtyards or outdoor venues<br/>• White shoes — same reasoning as white clothing<br/>• Shoes that are difficult to remove — many traditional ceremonies require removing footwear before entering certain spaces<br/><br/>A practical rule: if you are going to be on your feet for six or more hours, choose shoes you have worn before. A wedding is not the time to break in new heels.",
      },
    },

    // ── SECTION 8: BY OCCASION ──────────────────────────────────────────────
    {
      id: "b_h2_occasion",
      type: "heading",
      data: { level: 2, text: "8. Dressing for Each Occasion at a Multi-Day Wedding" },
    },
    {
      id: "b_p_occasion",
      type: "paragraph",
      data: {
        text: "If you are attending multiple events, you need multiple outfit ideas — or at least a plan for restyling one outfit across occasions.<br/><br/><strong>Mehendi / Haldi / Pre-Wedding Functions:</strong><br/>These daytime events are more relaxed and often held outdoors. Choose lighter fabrics and brighter, more playful colours — mustard, coral, turquoise, mint, or blush. A cotton kurta set, a printed co-ord, or a simple salwar suit works well. Keep jewellery lighter and avoid outfits you cannot afford to get a little haldi or colour on.<br/><br/><strong>The Wedding Ceremony (Bibah):</strong><br/>This is the most important and formal occasion. Choose your most impressive ethnic outfit — a rich silk saree, a heavily embellished kurta set, or a beautifully made lehenga. This is the event for your best jewellery and most polished look.<br/><br/><strong>Reception Dinner:</strong><br/>Receptions tend to be more contemporary and evening-appropriate. You have more flexibility here. A glamorous lehenga, a contemporary fusion set, a well-chosen maxi dress, or a different kurta set all work. The atmosphere is generally more social and celebratory, so you can go slightly more fashion-forward than you would at the ceremony.",
      },
    },

    // ── CONCLUSION ──────────────────────────────────────────────────────────
    {
      id: "b_h2_conclusion",
      type: "heading",
      data: { level: 2, text: "Final Thoughts: Dress to Celebrate" },
    },
    {
      id: "b_p_conclusion",
      type: "paragraph",
      data: {
        text: "A Nepali wedding is one of the most elaborate, joyful, and visually rich celebrations you will attend. Your outfit is part of that celebration — not just something to put on so you are covered.<br/><br/>The best wedding guest outfits are the ones that feel genuinely festive, are comfortable enough to last all day, and allow you to be present in the celebration rather than worrying about what you are wearing.<br/><br/>Choose something you feel truly good in. Whether that is a silk kurta set, a beautifully draped saree, or a contemporary fusion piece — wear it with intention, add your best accessories, and enjoy the occasion.",
      },
    },
    {
      id: "b_quote_1",
      type: "quote",
      data: {
        text: "Dress shabbily and they remember the dress; dress impeccably and they remember the woman.",
        caption: "Coco Chanel",
      },
    },

    // ── DIVIDER + FAQs ──────────────────────────────────────────────────────
    { id: "b_divider_1", type: "divider", data: {} },
    {
      id: "b_faq_1",
      type: "faq",
      data: {
        question: "What should I wear to a Nepali wedding as a guest?",
        answer: "A silk or embellished kurta set is the most versatile choice. A saree is always appropriate. A lehenga choli works for formal receptions. For modern weddings, contemporary fusion — a draped skirt, co-ord set, or elegant maxi dress — can also work well.",
      },
    },
    {
      id: "b_faq_2",
      type: "faq",
      data: {
        question: "What colours should I avoid at a Nepali wedding?",
        answer: "Avoid white or cream (the colour of mourning in Hindu tradition), red (the bride's colour), and all-black alone (considered inauspicious). Choose jewel tones, pastels, and rich neutrals instead.",
      },
    },
    {
      id: "b_faq_3",
      type: "faq",
      data: {
        question: "Can I wear a Western dress to a Nepali wedding?",
        answer: "At traditional ceremonies, ethnic wear is strongly preferred. For a modern reception dinner, a carefully chosen maxi dress in a rich colour with festive accessories can work. The key is making sure the outfit feels deliberately celebratory rather than casual.",
      },
    },
    {
      id: "b_faq_4",
      type: "faq",
      data: {
        question: "What jewellery should I wear to a Nepali wedding?",
        answer: "Gold-toned jewellery works with almost every ethnic outfit. Jhumka earrings, a layered necklace, and bangles are all appropriate. Choose one focal jewellery piece and keep the rest simpler to avoid an overwhelming look.",
      },
    },
    {
      id: "b_faq_5",
      type: "faq",
      data: {
        question: "What shoes are best for a Nepali wedding?",
        answer: "Block-heeled sandals or kitten heels are the most practical — they give height and elegance without being difficult to wear for hours. Embellished flat sandals are also a great option. Avoid very high stilettos, especially at outdoor or courtyard venues.",
      },
    },
    {
      id: "b_faq_6",
      type: "faq",
      data: {
        question: "Do I need a different outfit for each Nepali wedding function?",
        answer: "Ideally yes — pre-wedding functions like mehendi suit brighter, lighter outfits, the ceremony calls for your most formal ethnic look, and the reception allows more flexibility. If you can only bring one outfit, a rich silk kurta set is the most adaptable across all events.",
      },
    },
  ]

  // 5. Post data
  const postSlug = "what-to-wear-nepali-wedding-guest"
  const postData = {
    slug: postSlug,
    title: "What to Wear to a Nepali Wedding as a Guest: Complete Outfit Guide",
    excerpt: "Attending a Nepali wedding? Here is exactly what to wear — from the ceremony to the reception — with outfit ideas, colour rules, jewellery tips, and what to avoid.",
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
    readingTimeOverride: 9,
    locale: "en",
    seoTitle: "What to Wear to a Nepali Wedding as a Guest (2025 Guide)",
    metaDescription: "Complete guide on what to wear to a Nepali wedding as a guest — kurta sets, sarees, lehengas, fusion outfits, colour rules, jewellery, shoes and what to avoid.",
    canonicalUrl: `/journal/${postSlug}`,
    ogTitle: "What to Wear to a Nepali Wedding as a Guest",
    ogDescription: "Attending a Nepali wedding? Here is exactly what to wear — from the ceremony to the reception — with outfit ideas, colour rules, and everything to avoid.",
    ogImage: coverImageUrl,
    twitterTitle: "What to Wear to a Nepali Wedding as a Guest",
    twitterDescription: "Attending a Nepali wedding? Here is exactly what to wear — from the ceremony to the reception — with outfit ideas, colour rules, and everything to avoid.",
    twitterImage: coverImageUrl,
    robotsIndex: true,
    robotsFollow: true,
    focusKeyword: "what to wear to a Nepali wedding",
    publishedAt: new Date(),
    updatedAt: new Date(),
  }

  // 6. Upsert post
  const [existing] = await db
    .select()
    .from(journalPosts)
    .where(eq(journalPosts.slug, postSlug))
    .limit(1)

  let savedPost: any
  if (existing) {
    console.log(`🔄 Updating existing post (${existing.id})...`)
    const [updated] = await db
      .update(journalPosts)
      .set(postData)
      .where(eq(journalPosts.id, existing.id))
      .returning()
    savedPost = updated
  } else {
    console.log("✨ Creating new post...")
    const [inserted] = await db.insert(journalPosts).values(postData).returning()
    savedPost = inserted
  }

  // 7. Link tags
  await db.delete(journalPostTags).where(eq(journalPostTags.postId, savedPost.id))
  for (const tagId of tagIds) {
    await db
      .insert(journalPostTags)
      .values({ postId: savedPost.id, tagId })
      .onConflictDoNothing()
  }

  // 8. Save revision snapshot
  await db.insert(journalRevisions).values({
    postId: savedPost.id,
    revisionData: postData,
    changedById: adminUser.id,
  })

  console.log(`\n🎉 Wedding Guest Article Successfully Published!`)
  console.log(`📄 ID:    ${savedPost.id}`)
  console.log(`🔗 URL:   /journal/${savedPost.slug}`)
  console.log(`📊 State: ${savedPost.workflowState}`)
  console.log(`🏷️  Tags:  ${tagNames.join(", ")}`)
  console.log(`⏱️  Read:  ${postData.readingTimeOverride} min`)

  await sql.end()
}

importWeddingGuestArticle().catch((err) => {
  console.error("❌ Import failed:", err)
  process.exit(1)
})
