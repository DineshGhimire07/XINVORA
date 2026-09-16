// scripts/import-batch-4-articles.ts
// Articles: 1) Oversized Shirt  2) Office Outfits Kathmandu  3) Tihar Outfits  4) Midi Dress Styling

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import dotenv from "dotenv"
import path from "path"
import { eq } from "drizzle-orm"
import {
  journalCategories,
  journalTags,
  journalPosts,
  journalPostTags,
  journalRevisions,
  users,
} from "../src/db/schema"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

// ─── helpers ────────────────────────────────────────────────────────────────

async function ensureCategory(name: string, slug: string, description: string) {
  let [cat] = await db.select().from(journalCategories).where(eq(journalCategories.slug, slug)).limit(1)
  if (!cat) {
    const [newCat] = await db.insert(journalCategories).values({ name, slug, description }).returning()
    cat = newCat
    console.log(`  ✅ Created category: ${cat.name}`)
  }
  return cat
}

async function resolveTag(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
  let [tag] = await db.select().from(journalTags).where(eq(journalTags.slug, slug)).limit(1)
  if (!tag) {
    const [newTag] = await db.insert(journalTags).values({ name, slug }).returning()
    tag = newTag
  }
  return tag.id
}

async function upsertPost(postData: any, tagIds: string[], authorId: string) {
  const [existing] = await db.select().from(journalPosts).where(eq(journalPosts.slug, postData.slug)).limit(1)
  let saved: any
  if (existing) {
    const [updated] = await db.update(journalPosts).set(postData).where(eq(journalPosts.id, existing.id)).returning()
    saved = updated
    console.log(`  🔄 Updated: ${postData.slug}`)
  } else {
    const [inserted] = await db.insert(journalPosts).values(postData).returning()
    saved = inserted
    console.log(`  ✨ Created: ${postData.slug}`)
  }
  await db.delete(journalPostTags).where(eq(journalPostTags.postId, saved.id))
  for (const tagId of tagIds) {
    await db.insert(journalPostTags).values({ postId: saved.id, tagId }).onConflictDoNothing()
  }
  await db.insert(journalRevisions).values({ postId: saved.id, revisionData: postData, changedById: authorId })
  return saved
}

// ════════════════════════════════════════════════════════════════════════════
//  ARTICLE 1 — How to Style an Oversized Shirt: 8 Ways
// ════════════════════════════════════════════════════════════════════════════
async function article1(authorId: string, categoryId: string) {
  const cover = "/images/how-to-style-oversized-shirt.jpg"
  const tagIds = await Promise.all([
    "oversized shirt outfit", "how to style an oversized shirt", "outfit ideas",
    "women's fashion", "casual outfits", "styling tips", "Nepal fashion", "Gen Z fashion",
  ].map(resolveTag))

  const blocks = [
    { id: "b_intro", type: "paragraph", data: { text: "The oversized shirt is the most useful piece you probably already own — and the most underused.<br/><br/>Most people buy it, wear it once or twice the way they think it should be worn, decide it looks shapeless, and leave it hanging in the back of the wardrobe. The problem is never the shirt. It is always the styling.<br/><br/>An oversized shirt is not a shirt you just put on. It is a shirt you <strong>shape</strong> — through how you tuck it, what you pair it with, what you roll up, what you leave open. Done right, it creates some of the most effortless, flattering, and genuinely cool outfits in modern fashion.<br/><br/>Here are eight ways to style an oversized shirt that actually work." } },

    { id: "b_img_cover", type: "image", data: { urls: [cover], caption: "The oversized shirt styled with a front tuck into wide-leg jeans — one of the most reliably flattering combinations.", alt: "Young woman in an oversized white shirt front-tucked into wide-leg jeans with white sneakers" } },

    { id: "b_h2_1", type: "heading", data: { level: 2, text: "1. The Front Tuck Into Jeans" } },
    { id: "b_p_1", type: "paragraph", data: { text: "Tucking just the front of your oversized shirt into your jeans is the single most transformative thing you can do with it. It immediately creates a defined waistline without any effort, makes the outfit look intentional rather than sloppy, and shortens the visual length of the shirt so it stops overwhelming your silhouette.<br/><br/>It works with:<br/>• Straight-leg or wide-leg jeans<br/>• High-waisted trousers<br/>• Midi skirts<br/><br/>The tuck does not need to be neat. In fact, a slightly messy, relaxed front tuck looks more natural and confident than a perfectly even one. Just pull a small section of the front hem into your waistband and leave the rest out." } },
    { id: "b_callout_1", type: "callout", data: { title: "Tuck Tip", text: "Tuck only a thumb-width of fabric — just enough to suggest a waist, not enough to look stiff. The looser and more casual the tuck, the more effortless the outfit reads.", type: "info" } },

    { id: "b_h2_2", type: "heading", data: { level: 2, text: "2. Belted at the Waist" } },
    { id: "b_p_2", type: "paragraph", data: { text: "Adding a belt to an oversized shirt transforms it into something much closer to a dress or a structured layer. Thread a thin leather belt through the shirt loops (if it has them) or cinch it loosely around the outside for a completely different silhouette.<br/><br/>This works particularly well with:<br/>• Longer oversized shirts that hit mid-thigh<br/>• Linen or cotton shirts in neutral colours<br/>• Worn with wide-leg trousers or as a mini-dress with boots<br/><br/>A tan or black leather belt in a simple metal clasp is the most elegant choice. Avoid overly wide or decorative belts — they compete with the shirt rather than completing it." } },

    { id: "b_h2_3", type: "heading", data: { level: 2, text: "3. Open Over a Fitted Outfit" } },
    { id: "b_p_3", type: "paragraph", data: { text: "An unbuttoned oversized shirt worn open over a fitted outfit works exactly like a jacket — but lighter, more relaxed, and far more versatile.<br/><br/>Try it over:<br/>• A white fitted tank top + straight-leg jeans<br/>• A fitted midi dress<br/>• A simple ribbed top + bike shorts or leggings<br/>• A slip dress for an easy evening-to-day transition<br/><br/>White, blue denim, and neutral linen shirts work best for this. Leave the shirt completely unbuttoned and roll the sleeves to just below the elbow. The overall effect is deliberately effortless — the kind of look that seems like it took no thought but actually communicates a strong sense of personal style." } },

    { id: "b_h2_4", type: "heading", data: { level: 2, text: "4. Tied at the Front" } },
    { id: "b_p_4", type: "paragraph", data: { text: "Tie the front two panels of your oversized shirt together at your natural waist, leaving the rest open and the tails hanging. This creates a cropped effect without actually cutting the shirt, and the tied knot becomes a small style detail that pulls the whole look together.<br/><br/>This works best on:<br/>• High-waisted jeans or shorts<br/>• Wide-leg trousers<br/>• Over a bikini top for a beach or poolside look<br/><br/>Keep the knot loose and positioned at the side rather than the front for a slightly more relaxed, editorial feel. A flannel, chambray, or linen shirt in a checked or solid pattern all work well for this style." } },

    { id: "b_h2_5", type: "heading", data: { level: 2, text: "5. Tucked Fully Into a High-Waisted Skirt" } },
    { id: "b_p_5", type: "paragraph", data: { text: "Fully tucking an oversized shirt into a high-waisted midi or maxi skirt creates an outfit that looks unexpectedly polished and intentional. The volume of the shirt gets contained by the skirt waistband, and the combination reads as effortlessly dressed-up.<br/><br/>Best skirt pairings:<br/>• A flowing satin midi skirt in a neutral or jewel tone<br/>• A structured A-line midi skirt<br/>• A denim midi skirt<br/>• A printed wrap skirt<br/><br/>The key is to choose a skirt with a high enough waist to contain most of the shirt's bulk. Add simple pointed flats or block heels to complete the look." } },

    { id: "b_h2_6", type: "heading", data: { level: 2, text: "6. Worn as a Dress" } },
    { id: "b_p_6", type: "paragraph", data: { text: "If your oversized shirt is long enough to hit mid-thigh or lower, you can wear it as a dress in its own right. This works best with a belt to define the waist, but can also work with confident styling alone.<br/><br/>For a shirt-as-dress look:<br/>• Add a thin belt or tie at the waist<br/>• Pair with ankle boots or over-the-knee boots<br/>• Add opaque tights for cooler weather<br/>• Keep accessories simple — the oversized silhouette is already making a statement<br/><br/>Linen shirts, chambray shirts, and denim shirts all work for this. Avoid very stiff fabrics that do not drape naturally as they will look awkward without proper structure underneath." } },
    { id: "b_callout_6", type: "callout", data: { title: "Shirt Dress Shortcut", text: "Choose a shirt that is at least 5–6 sizes larger than your usual size for this to work. A shirt that is just one or two sizes up will rarely be long enough to wear as a standalone dress.", type: "info" } },

    { id: "b_h2_7", type: "heading", data: { level: 2, text: "7. With Wide-Leg or Baggy Trousers" } },
    { id: "b_p_7", type: "paragraph", data: { text: "Oversized shirt + baggy trousers is a combination that should not work — two large, relaxed pieces together — but consistently does when executed correctly.<br/><br/>The secret is in the proportion: front-tuck the shirt slightly to give the waist definition, roll the trouser hem once to show the ankle, and make sure your footwear is simple and clean. White sneakers or minimal loafers keep this combination grounded rather than overwhelming.<br/><br/>This is one of the most effortlessly comfortable outfit formulas in contemporary fashion, and it translates extremely well to a Nepal context where comfort matters across long days." } },

    { id: "b_h2_8", type: "heading", data: { level: 2, text: "8. Layered Under a Blazer or Jacket" } },
    { id: "b_p_8", type: "paragraph", data: { text: "An oversized shirt layered under a structured blazer creates an interesting proportion play — relaxed underneath, structured over the top. The collar of the oversized shirt peeking out above the blazer lapel is a small but effective styling detail.<br/><br/>Try:<br/>• White oversized shirt + camel or charcoal blazer + straight-leg trousers<br/>• Striped oversized shirt + denim jacket + wide-leg jeans<br/>• Oversized linen shirt + leather jacket for an edgier combination<br/><br/>Tuck the front of the shirt loosely when wearing a blazer on top. If the blazer is well-fitted, the shirt volume underneath adds texture without adding bulk." } },

    { id: "b_h2_conclusion", type: "heading", data: { level: 2, text: "One Shirt, Eight Different Outfits" } },
    { id: "b_p_conclusion", type: "paragraph", data: { text: "The oversized shirt might be the single most versatile piece in modern women's fashion. The same shirt — tucked, tied, belted, open, worn as a dress — creates genuinely different outfits for completely different occasions.<br/><br/>If you do not already own one, invest in a good quality version in white, cream, or light blue. Natural fabrics — linen, cotton, chambray — drape better and get more beautiful with wear.<br/><br/>Then experiment. The styling possibilities extend well beyond the eight combinations here." } },
    { id: "b_quote_1", type: "quote", data: { text: "Fashion is about something that comes from within you.", caption: "Ralph Lauren" } },

    { id: "b_divider_1", type: "divider", data: {} },
    { id: "b_faq_1", type: "faq", data: { question: "How do you style an oversized shirt without looking shapeless?", answer: "The front tuck is the most effective trick — tuck just the front hem into your waistband to suggest a waist. A belt works similarly. Pairing with fitted bottoms also helps balance the volume of an oversized shirt." } },
    { id: "b_faq_2", type: "faq", data: { question: "Can you wear an oversized shirt as a dress?", answer: "Yes — if the shirt is long enough (mid-thigh or below) and you add a belt or tie at the waist. Pair with ankle boots or over-the-knee boots and simple accessories." } },
    { id: "b_faq_3", type: "faq", data: { question: "What is the best way to tuck an oversized shirt?", answer: "The French tuck (front tuck) — tucking only the front section of the shirt into your waistband — is the most flattering and versatile option. It creates waist definition while keeping the look relaxed." } },
    { id: "b_faq_4", type: "faq", data: { question: "What bottoms work best with an oversized shirt?", answer: "High-waisted jeans, wide-leg trousers, midi skirts, and tailored shorts all work well. High-waisted bottoms help manage the shirt's volume and create a defined silhouette." } },
  ]

  return upsertPost({
    slug: "how-to-style-oversized-shirt",
    title: "How to Style an Oversized Shirt: 8 Ways That Actually Work",
    excerpt: "The oversized shirt is one of the most versatile pieces you can own — if you know how to style it. Here are 8 ways that genuinely work.",
    body: blocks, coverImage: cover, gallery: [cover], authorId, categoryId,
    workflowState: "PUBLISHED", visibility: "PUBLIC", isFeatured: true, allowComments: true,
    readingTimeOverride: 7, locale: "en",
    seoTitle: "How to Style an Oversized Shirt: 8 Ways That Actually Work",
    metaDescription: "Learn 8 ways to style an oversized shirt — from the front tuck to wearing it as a dress. Practical styling tips with outfit formulas that work.",
    canonicalUrl: "/journal/how-to-style-oversized-shirt",
    ogTitle: "How to Style an Oversized Shirt: 8 Ways That Actually Work",
    ogDescription: "The oversized shirt styled 8 different ways — casual, dressy, layered, belted, and more.",
    ogImage: cover, twitterTitle: "8 Ways to Style an Oversized Shirt",
    twitterDescription: "8 outfit formulas for your oversized shirt — all of them actually work.",
    twitterImage: cover, robotsIndex: true, robotsFollow: true,
    focusKeyword: "how to style an oversized shirt", publishedAt: new Date(), updatedAt: new Date(),
  }, tagIds, authorId)
}

// ════════════════════════════════════════════════════════════════════════════
//  ARTICLE 2 — Office Outfit Ideas for Women in Kathmandu
// ════════════════════════════════════════════════════════════════════════════
async function article2(authorId: string, categoryId: string) {
  const cover = "/images/office-outfit-ideas-women-kathmandu.jpg"
  const tagIds = await Promise.all([
    "office outfit", "work outfit ideas", "office fashion Nepal",
    "women's fashion", "professional outfits", "Kathmandu fashion",
    "styling tips", "outfit ideas", "business casual",
  ].map(resolveTag))

  const blocks = [
    { id: "b_intro", type: "paragraph", data: { text: "Getting dressed for work every morning should be one of the easier decisions of your day. In practice, it is often one of the most stressful — especially when your wardrobe is full of clothes that feel either too casual or too formal for the environment you actually work in.<br/><br/>Kathmandu's professional scene is diverse. A corporate bank, a design agency, a government office, and a startup each have different unspoken dress codes. But most working women in Nepal navigate something in between: environments that expect a <strong>polished, put-together appearance</strong> without requiring a strict formal uniform.<br/><br/>This guide covers practical, stylish office outfit ideas for women in Kathmandu — from Monday meetings to Friday presentations." } },

    { id: "b_img_cover", type: "image", data: { urls: [cover], caption: "A structured camel blazer over a white blouse and tailored trousers — a reliable foundation for office dressing in Kathmandu.", alt: "Professional woman in a camel blazer outside a Kathmandu office building" } },

    { id: "b_callout_rule", type: "callout", data: { title: "The Kathmandu Office Rule", text: "Most Kathmandu offices fall into 'smart casual' or 'business casual' — not strict formal. This means tailored pieces, quality fabrics, and polished accessories, without requiring a suit or highly formal attire every day.", type: "info" } },

    { id: "b_h2_1", type: "heading", data: { level: 2, text: "1. The Blazer Formula: Your Most Reliable Work Outfit" } },
    { id: "b_p_1", type: "paragraph", data: { text: "A well-fitted blazer is the single most transformative piece for office dressing. It instantly elevates almost any outfit underneath it — a simple white T-shirt and trousers becomes a polished work look the moment you add a blazer.<br/><br/><strong>The core blazer formula:</strong><br/>Blazer + fitted top (blouse, knit, or button-down) + tailored trousers or midi skirt + simple shoes.<br/><br/><strong>Best blazer colours for Kathmandu offices:</strong><br/>• Camel — warm, professional, works with almost everything<br/>• Charcoal grey — crisp, versatile, especially strong for formal environments<br/>• Black — reliable but can feel heavy in summer<br/>• Navy — a more interesting alternative to black<br/>• Cream or ecru — fresh and polished for warmer months<br/><br/>Buy the best quality blazer you can afford. This is the single piece most worth spending more on because it will be worn consistently across years, not seasons." } },

    { id: "b_h2_2", type: "heading", data: { level: 2, text: "2. The Kurta Set: Professional and Culturally Appropriate" } },
    { id: "b_p_2", type: "paragraph", data: { text: "A well-chosen kurta set is one of the most practical office outfits for women in Nepal — particularly in more traditional or government-adjacent workplaces where ethnic wear is quietly expected or respected.<br/><br/>The difference between a casual kurta set and a professional one lies in fabric and silhouette. For the office:<br/>• Choose structured fabrics — cotton twill, silk, georgette, or a quality blend<br/>• Opt for clean, minimal embellishment or no embellishment at all<br/>• Stick to solid colours or subtle prints rather than bold patterns<br/>• Pair with simple, well-fitted matching or coordinating bottoms<br/><br/><strong>Best colours for a professional kurta set:</strong> Navy, deep teal, charcoal, dusty rose, muted green, ivory, or black. Avoid neons, overly bright prints, or heavily embroidered pieces for routine office days." } },

    { id: "b_h2_3", type: "heading", data: { level: 2, text: "3. Tailored Trousers + Blouse: The Classic Combination" } },
    { id: "b_p_3", type: "paragraph", data: { text: "High-waisted tailored trousers paired with a silk or cotton blouse is one of the most reliable professional outfit formulas — and one that is rarely wrong in any workplace.<br/><br/><strong>Trouser choices for the office:</strong><br/>• Wide-leg trousers in black, navy, or charcoal for a modern, polished look<br/>• Straight-leg trousers for a cleaner, more traditional silhouette<br/>• High-waisted cut — this is the most flattering for most body types and feels most professional<br/><br/><strong>Blouse choices:</strong><br/>• Silk or satin blouse in cream, white, or a subtle colour<br/>• A fitted button-down in white or blue<br/>• A quality knit top in a neutral shade<br/><br/>Add simple pointed flats or block heels, a structured bag, and minimal jewellery. This combination requires no additional styling decisions — it works every time." } },

    { id: "b_h2_4", type: "heading", data: { level: 2, text: "4. The Midi Skirt: Smart, Comfortable, Polished" } },
    { id: "b_p_4", type: "paragraph", data: { text: "A midi skirt in a tailored fabric is one of the most comfortable yet polished choices for office wear — especially in Kathmandu's warmer months when trousers feel heavy.<br/><br/>The most office-appropriate midi skirts are:<br/>• A-line or straight cut (not flowing or flowy)<br/>• In solid colours or subtle patterns — pencil stripes, fine checks, or small prints<br/>• In structured fabrics — ponte, cotton blend, or a quality synthetic that holds its shape<br/><br/>Pair with a fitted top or blouse tucked in, a blazer for important meetings, and simple heels or flats. A midi skirt and blazer combination is one of the most effortlessly professional looks you can put together." } },

    { id: "b_h2_5", type: "heading", data: { level: 2, text: "5. Smart Casual: When Your Office Has a Relaxed Dress Code" } },
    { id: "b_p_5", type: "paragraph", data: { text: "Many Kathmandu offices — especially in tech, creative industries, and NGOs — have relaxed dress codes where jeans are acceptable. Smart casual dressing here means looking polished and intentional, not formal.<br/><br/><strong>Smart casual office formula:</strong><br/>Dark wash straight-leg jeans + a quality knit or blouse + a blazer or structured cardigan + clean sneakers or simple flats.<br/><br/>The blazer is the key element that elevates this from purely casual to workplace-appropriate. Without it, the same combination of jeans and a top may feel too relaxed for a professional environment.<br/><br/>Avoid jeans that are distressed, very light wash, or heavily embellished for office settings. A dark, clean denim in a tailored cut is the most professional version." } },

    { id: "b_callout_5", type: "callout", data: { title: "Quick Upgrade Trick", text: "If you are unsure whether your outfit is professional enough, add a blazer. A blazer over almost any smart-casual outfit immediately shifts it into workplace-appropriate territory.", type: "info" } },

    { id: "b_h2_6", type: "heading", data: { level: 2, text: "6. Dressing for Kathmandu's Climate in the Office" } },
    { id: "b_p_6", type: "paragraph", data: { text: "Kathmandu's climate creates some specific dressing challenges for professional women:<br/><br/><strong>Summer (April–September):</strong> Opt for breathable natural fabrics — linen trousers, cotton blouses, lightweight georgette kurtas. Avoid heavy synthetic fabrics that trap heat. Light colours (cream, white, pale blue) are more comfortable. A thin cardigan or light blazer keeps you office-appropriate even on very warm days.<br/><br/><strong>Winter (November–February):</strong> Layering is essential. A quality knit turtleneck under a blazer, or a cashmere or merino cardigan over a blouse, keeps you warm without bulky outer layers. Wool or wool-blend trousers are more comfortable than cotton in cold months.<br/><br/><strong>Monsoon (June–August):</strong> Choose darker colours and quick-drying fabrics. Avoid light silk or heavily structured pieces that are difficult to dry quickly. Waterproof flats or simple boots are more practical than open sandals." } },

    { id: "b_h2_7", type: "heading", data: { level: 2, text: "7. Office Shoes and Bags: Keeping It Practical and Polished" } },
    { id: "b_p_7", type: "paragraph", data: { text: "Office accessories in Kathmandu need to balance professionalism with practicality — especially given the city's varied road conditions.<br/><br/><strong>Best office shoes:</strong><br/>• Block-heeled pumps in black, nude, or camel — professional height without instability<br/>• Pointed-toe flats in leather or faux leather<br/>• Simple loafers — increasingly acceptable even in more formal environments<br/>• Clean white or minimal sneakers for casual offices<br/><br/><strong>Best office bags:</strong><br/>• A structured tote in tan, black, or navy — large enough for a laptop and daily essentials<br/>• A medium shoulder bag in a quality leather or leather-look material<br/>• Avoid very small bags (impractical) or very casual backpacks (unless your office is explicitly relaxed)" } },

    { id: "b_h2_conclusion", type: "heading", data: { level: 2, text: "Building a Working Wardrobe That Actually Works" } },
    { id: "b_p_conclusion", type: "paragraph", data: { text: "The most functional professional wardrobe is not a collection of separate \"work outfits.\" It is a cohesive set of pieces that mix and match naturally — a few blazers, a few pairs of tailored trousers, quality blouses and knits, and versatile shoes and bags that work across all of them.<br/><br/>Start with one excellent blazer, two pairs of tailored trousers (one black, one navy or camel), three quality blouses, and two pairs of practical but polished shoes. These core pieces will cover most professional situations and serve as the foundation for everything else you add over time." } },

    { id: "b_divider_1", type: "divider", data: {} },
    { id: "b_faq_1", type: "faq", data: { question: "What is the dress code for most offices in Kathmandu?", answer: "Most Kathmandu offices operate on a smart casual or business casual dress code — tailored pieces, quality fabrics, and polished accessories are expected, but a strict formal suit is rarely required outside of banking, law, or government settings." } },
    { id: "b_faq_2", type: "faq", data: { question: "Can I wear a kurta set to a professional office in Nepal?", answer: "Yes — a quality kurta set in a structured fabric and minimal embellishment is professional and culturally appropriate for most Nepali workplaces. Choose solid colours or subtle prints and avoid heavily embroidered or festive-style pieces for regular office wear." } },
    { id: "b_faq_3", type: "faq", data: { question: "Can I wear jeans to work in Kathmandu?", answer: "This depends on your specific workplace. Many creative, NGO, and tech offices in Kathmandu accept dark-wash, clean denim. Adding a blazer immediately makes jeans more office-appropriate. Traditional corporate, banking, and government offices typically expect more formal attire." } },
    { id: "b_faq_4", type: "faq", data: { question: "What is the most versatile office outfit for women?", answer: "A well-fitted blazer over tailored trousers and a simple blouse is the most reliable professional outfit across different workplace environments. It is polished, comfortable, and works for everything from regular workdays to important meetings." } },
  ]

  return upsertPost({
    slug: "office-outfit-ideas-women-kathmandu",
    title: "Office Outfit Ideas for Women in Kathmandu: What to Wear to Work",
    excerpt: "Practical, polished office outfit ideas for women in Kathmandu — from the blazer formula to smart casual, with climate tips and bag and shoe advice.",
    body: blocks, coverImage: cover, gallery: [cover], authorId, categoryId,
    workflowState: "PUBLISHED", visibility: "PUBLIC", isFeatured: true, allowComments: true,
    readingTimeOverride: 8, locale: "en",
    seoTitle: "Office Outfit Ideas for Women in Kathmandu (2025 Work Style Guide)",
    metaDescription: "Practical office outfit ideas for women working in Kathmandu — blazer formulas, kurta sets, smart casual, climate tips, and shoe and bag advice.",
    canonicalUrl: "/journal/office-outfit-ideas-women-kathmandu",
    ogTitle: "Office Outfit Ideas for Women in Kathmandu",
    ogDescription: "What to wear to work in Kathmandu — practical, polished office outfits with climate advice and professional styling tips.",
    ogImage: cover, twitterTitle: "Office Outfit Ideas for Women in Kathmandu",
    twitterDescription: "What to wear to work in Kathmandu — blazers, kurta sets, smart casual, and climate-conscious dressing.",
    twitterImage: cover, robotsIndex: true, robotsFollow: true,
    focusKeyword: "office outfit ideas women Kathmandu", publishedAt: new Date(), updatedAt: new Date(),
  }, tagIds, authorId)
}

// ════════════════════════════════════════════════════════════════════════════
//  ARTICLE 3 — Tihar Outfit Ideas for Women in Nepal
// ════════════════════════════════════════════════════════════════════════════
async function article3(authorId: string, categoryId: string) {
  // Reuse the dashain cover as a close visual placeholder until a new image is generated
  const cover = "/images/dashain-outfits-nepal-cover.jpg"
  const tagIds = await Promise.all([
    "Tihar fashion", "Tihar outfit ideas", "Nepal fashion",
    "festive outfits", "Nepali festival outfits", "ethnic wear",
    "women's fashion", "Tihar celebration", "Laxmi Puja outfit",
  ].map(resolveTag))

  const blocks = [
    { id: "b_intro", type: "paragraph", data: { text: "Tihar — Nepal's Festival of Lights — is one of the most visually beautiful times of the year. The streets are lined with oil diyas, homes are decorated with marigold garlands and colourful rangoli, and there is a distinct warmth in the air as families come together to celebrate Laxmi Puja, Kukur Tihar, Gai Puja, and Bhai Tika.<br/><br/>It is also one of those occasions when what you wear genuinely feels like part of the celebration.<br/><br/>This guide covers <strong>Tihar outfit ideas for women in Nepal</strong> — from what to wear on Laxmi Puja evening to Bhai Tika morning, with practical advice on colours, fabrics, jewellery, and how to balance tradition with your personal style." } },

    { id: "b_callout_tihar", type: "callout", data: { title: "Tihar Colour Tradition", text: "Tihar is associated with warmth, light, and prosperity. The most auspicious colours are yellow, gold, deep orange, and warm red — reflecting the colours of marigolds, diyas, and Laxmi Puja offerings. Deep teal, emerald, and rich purple are also popular festive choices.", type: "info" } },

    { id: "b_h2_1", type: "heading", data: { level: 2, text: "1. What to Wear on Laxmi Puja Evening" } },
    { id: "b_p_1", type: "paragraph", data: { text: "Laxmi Puja is the evening at the heart of Tihar — the night when homes are lit with diyas and Goddess Laxmi is welcomed. Most families dress in their best festive clothes for this occasion.<br/><br/><strong>Best outfit choices for Laxmi Puja:</strong><br/>• A rich silk or georgette kurta set in yellow, gold, deep orange, or maroon<br/>• A saree in an auspicious colour with gold accents<br/>• An embellished or embroidered ethnic set in jewel tones — teal, emerald, deep purple<br/><br/>This is the most formal evening of Tihar, so your outfit should reflect that. Rich fabrics, beautiful embellishment, and your best gold jewellery are all appropriate and encouraged.<br/><br/>Yellow and gold are particularly meaningful on Laxmi Puja — they represent prosperity, light, and the goddess herself. If you own a beautiful yellow or mustard outfit, this is the perfect occasion to wear it." } },
    { id: "b_img_cover", type: "image", data: { urls: [cover], caption: "Festive Nepali ethnic wear in deep, auspicious colours is the most celebrated choice for Tihar celebrations.", alt: "Young Nepali woman in a festive kurta set for Tihar" } },

    { id: "b_h2_2", type: "heading", data: { level: 2, text: "2. Bhai Tika: The Most Photographed Day of Tihar" } },
    { id: "b_p_2", type: "paragraph", data: { text: "Bhai Tika — the day sisters apply tika to their brothers — is the most emotionally significant day of Tihar. It is also the day that generates the most family photographs, which means your outfit choices matter in a lasting way.<br/><br/>The best Bhai Tika outfits balance festivity with comfort — this is an occasion where you will be sitting on the floor, performing a ritual, eating, and spending extended time with family.<br/><br/><strong>Ideal Bhai Tika outfit choices:</strong><br/>• A comfortable but beautiful kurta set in a festive colour<br/>• A saree you can sit and move in comfortably<br/>• A contemporary ethnic co-ord set in a rich fabric<br/>• A well-cut lehenga set if you prefer more formal dressing<br/><br/>Whatever you choose, make sure it is something you can wear for several hours comfortably. The ritual involves sitting on the floor and standing multiple times." } },

    { id: "b_h2_3", type: "heading", data: { level: 2, text: "3. Tihar Colours: What Works Best" } },
    { id: "b_p_3", type: "paragraph", data: { text: "Tihar has a distinct colour palette that is different from Dashain's deeper, more subdued festive tones.<br/><br/><strong>Most auspicious for Tihar:</strong><br/>• <strong>Yellow and mustard</strong> — the colour of marigolds, deeply connected to Tihar's visual identity<br/>• <strong>Gold and amber</strong> — reflecting diya light and Laxmi Puja offerings<br/>• <strong>Deep orange and saffron</strong> — warm, festive, and photogenic<br/>• <strong>Rich maroon and burgundy</strong> — works for both Laxmi Puja and Bhai Tika<br/><br/><strong>Also beautiful for Tihar:</strong><br/>• Emerald green<br/>• Deep teal<br/>• Rich purple or plum<br/>• Bright pink or fuchsia<br/><br/>Avoid white (inauspicious) and very dark, muted colours that lack the warmth expected at a Festival of Lights." } },

    { id: "b_h2_4", type: "heading", data: { level: 2, text: "4. The Modern Tihar Outfit: Contemporary Festive Dressing" } },
    { id: "b_p_4", type: "paragraph", data: { text: "Not every woman wants to wear a traditionally styled kurta set or saree for every Tihar occasion. Contemporary festive dressing acknowledges this while still honouring the spirit of the celebration.<br/><br/><strong>Modern alternatives that still feel Tihar-appropriate:</strong><br/>• A festive co-ord set in a rich fabric and warm colour — mustard, gold, or deep orange<br/>• A silk or satin midi dress in an auspicious colour with traditional jewellery<br/>• A contemporary ethnic set with subtle embellishment<br/>• A solid-coloured maxi dress in a festive tone with a dupatta added for the puja moment<br/><br/>The key for contemporary Tihar dressing: the colour must carry the festive feeling, even if the silhouette is modern. A simple yellow midi dress with gold jewellery and a marigold in your hair communicates Tihar far more effectively than a complex ethnic outfit in a non-festive colour." } },

    { id: "b_h2_5", type: "heading", data: { level: 2, text: "5. Tihar Jewellery and Accessories" } },
    { id: "b_p_5", type: "paragraph", data: { text: "Tihar is one of the best occasions for gold-toned jewellery — it aligns perfectly with the warmth and radiance of the festival.<br/><br/><strong>Classic Tihar jewellery choices:</strong><br/>• Jhumka or chandelier earrings in gold<br/>• A layered gold necklace or a single statement choker<br/>• Gold or gold-filled bangles — the more the better for this occasion<br/>• A maang tikka if you are attending a formal puja or family gathering<br/><br/><strong>Accessories that complete a Tihar look:</strong><br/>• A small embroidered potli or clutch in a coordinating colour<br/>• Embellished or festive footwear — heeled sandals in gold, bronze, or a complementary shade<br/>• A marigold or fresh flower in the hair for a distinctly Tihar touch<br/><br/>Flowers are one of the most authentic and beautiful accessories you can add to a Tihar look. A single marigold tucked behind the ear or woven into a braid connects you to the festival's visual language immediately." } },

    { id: "b_h2_6", type: "heading", data: { level: 2, text: "6. Comfortable Tihar Outfits for Long Festival Days" } },
    { id: "b_p_6", type: "paragraph", data: { text: "Tihar spans five days and involves significant movement — visiting neighbours, performing pujas, greeting family, eating elaborate meals. Comfort is not a compromise; it is a necessity.<br/><br/><strong>For comfortable multi-day Tihar dressing:</strong><br/>• Breathable cotton or lightweight georgette kurta sets in festive colours<br/>• Salwar suits with relaxed but festive proportions<br/>• A wrap-style maxi dress in a warm colour for more casual days<br/>• Flat embellished sandals over heels for Kukur Tihar and Gai Puja days when you are more active<br/><br/>Reserve your most elaborate outfit for Laxmi Puja evening and Bhai Tika. For the other days — Kaag Tihar, Kukur Tihar, Gai Puja — a beautiful but more relaxed festive outfit is entirely appropriate and much more practical." } },

    { id: "b_h2_conclusion", type: "heading", data: { level: 2, text: "Dress to Celebrate the Light" } },
    { id: "b_p_conclusion", type: "paragraph", data: { text: "Tihar is a festival about warmth, light, and the connections between people. Your outfit should reflect that spirit — festive without being overdone, beautiful without being uncomfortable, personal without losing the feeling of celebration.<br/><br/>Choose colours that make you feel genuinely radiant. Add jewellery that feels joyful. Wear something you can move through a full day of celebration in.<br/><br/>The best Tihar outfit is one that lets you be completely present in the festival — not one that requires constant adjustment or self-consciousness. Dress beautifully, then forget about what you are wearing and enjoy the light." } },

    { id: "b_divider_1", type: "divider", data: {} },
    { id: "b_faq_1", type: "faq", data: { question: "What should I wear for Tihar in Nepal?", answer: "A kurta set, saree, or contemporary ethnic outfit in festive colours — particularly yellow, gold, orange, maroon, teal, or emerald — is ideal for most Tihar occasions. Laxmi Puja evening calls for your most formal festive look; other days can be more relaxed." } },
    { id: "b_faq_2", type: "faq", data: { question: "What are the best colours to wear for Tihar?", answer: "Yellow, mustard, gold, deep orange, maroon, and amber are the most auspicious for Tihar as they reflect the festival's connection to marigolds, diyas, and Goddess Laxmi. Teal, emerald, and deep purple are also beautiful festive choices." } },
    { id: "b_faq_3", type: "faq", data: { question: "What should I wear for Bhai Tika?", answer: "Choose something beautiful, festive, and comfortable enough to wear for several hours while sitting and moving through family rituals. A silk or embellished kurta set in an auspicious colour with gold jewellery is the most popular choice." } },
    { id: "b_faq_4", type: "faq", data: { question: "Can I wear a modern outfit for Tihar?", answer: "Yes. A festive midi dress, a contemporary ethnic co-ord set, or a satin dress in a warm festive colour can all feel appropriate for Tihar — particularly for more casual days or reception dinners. The key is the colour: make sure it feels warm and celebratory." } },
    { id: "b_faq_5", type: "faq", data: { question: "What jewellery should I wear for Tihar?", answer: "Gold-toned jewellery is ideal for Tihar — jhumka earrings, gold bangles, a layered necklace, and a maang tikka for more formal pujas. Flowers (especially marigolds) in the hair are a beautiful and authentic Tihar accessory." } },
  ]

  return upsertPost({
    slug: "tihar-outfit-ideas-nepal",
    title: "Tihar Outfit Ideas for Women in Nepal: What to Wear for the Festival of Lights",
    excerpt: "From Laxmi Puja evening to Bhai Tika morning, here are the best Tihar outfit ideas for women in Nepal — with colour guides, jewellery tips, and modern festive alternatives.",
    body: blocks, coverImage: cover, gallery: [cover], authorId, categoryId,
    workflowState: "PUBLISHED", visibility: "PUBLIC", isFeatured: false, allowComments: true,
    readingTimeOverride: 7, locale: "en",
    seoTitle: "Tihar Outfit Ideas for Women in Nepal: Festival of Lights Style Guide",
    metaDescription: "Discover the best Tihar outfit ideas for women in Nepal — from Laxmi Puja to Bhai Tika, with colour guides, jewellery tips, and modern festive alternatives.",
    canonicalUrl: "/journal/tihar-outfit-ideas-nepal",
    ogTitle: "Tihar Outfit Ideas for Women in Nepal",
    ogDescription: "From Laxmi Puja to Bhai Tika — what to wear for Tihar, the Festival of Lights, with colour guides and jewellery tips.",
    ogImage: cover, twitterTitle: "Tihar Outfit Ideas for Women in Nepal",
    twitterDescription: "What to wear for Tihar — from Laxmi Puja to Bhai Tika, with colour guides and modern festive alternatives.",
    twitterImage: cover, robotsIndex: true, robotsFollow: true,
    focusKeyword: "Tihar outfit ideas Nepal", publishedAt: new Date(), updatedAt: new Date(),
  }, tagIds, authorId)
}

// ════════════════════════════════════════════════════════════════════════════
//  ARTICLE 4 — How to Wear a Midi Dress: 7 Styling Ideas
// ════════════════════════════════════════════════════════════════════════════
async function article4(authorId: string, categoryId: string) {
  const cover = "/images/capsule-wardrobe-women-nepal.jpg"
  const tagIds = await Promise.all([
    "midi dress outfit", "how to style a midi dress", "midi dress ideas",
    "women's fashion", "outfit ideas", "styling tips", "dress outfits",
    "Nepal fashion", "casual outfits",
  ].map(resolveTag))

  const blocks = [
    { id: "b_intro", type: "paragraph", data: { text: "The midi dress sits in one of fashion's most interesting positions — long enough to feel substantial and elegant, short enough to stay light and easy. It works for almost every occasion and almost every season, and yet it is one of the most commonly under-styled pieces in most wardrobes.<br/><br/>People tend to buy a midi dress, wear it one way, and never quite figure out how else it can work. This guide changes that.<br/><br/>Here are seven different ways to style a midi dress — each creating a genuinely distinct look from the same piece." } },

    { id: "b_callout_intro", type: "callout", data: { title: "Why the Midi Length Works", text: "The midi hits between the knee and ankle — a length that is universally flattering, appropriate for almost every setting, and works across seasons with the right layers. It is one of the few dress lengths that genuinely does everything.", type: "info" } },

    { id: "b_h2_1", type: "heading", data: { level: 2, text: "1. With White Sneakers: The Casual Everyday Look" } },
    { id: "b_p_1", type: "paragraph", data: { text: "A midi dress with clean white sneakers is one of the most reliably good casual outfits you can put together. The contrast between the dress's more formal length and the casual shoe creates an effortlessly cool effect.<br/><br/>This works with:<br/>• Floral or printed midi dresses<br/>• Solid-coloured satin or slip-style midis<br/>• Knit or jersey midi dresses<br/><br/>Keep accessories minimal — a small shoulder bag, simple hoop earrings, and sunglasses. No blazer or jacket required. This is the combination for days when you want to look put-together without any effort.<br/><br/>A denim jacket thrown over the shoulders (not worn, just draped) adds an additional layer of casual polish." } },

    { id: "b_h2_2", type: "heading", data: { level: 2, text: "2. With a Blazer: From Casual to Smart Casual" } },
    { id: "b_p_2", type: "paragraph", data: { text: "Adding a blazer over a midi dress immediately shifts it from casual to smart casual — or even workplace appropriate. This is one of the most useful outfit transitions in a wardrobe.<br/><br/><strong>The combination works because:</strong> The midi dress provides a clean base; the blazer adds structure and professionalism. Together they cover a wide range of occasions from a work presentation to a dinner out.<br/><br/><strong>Best pairings:</strong><br/>• A solid-coloured midi dress + contrasting blazer (e.g., a navy dress + camel blazer)<br/>• A printed midi + neutral blazer that picks up one colour from the print<br/>• A black midi + any coloured blazer<br/><br/>Wear the blazer properly (both arms in) for a more formal look, or push the sleeves up and let it sit slightly off the shoulders for a more relaxed effect." } },

    { id: "b_h2_3", type: "heading", data: { level: 2, text: "3. With Ankle Boots: The Autumn and Winter Formula" } },
    { id: "b_p_3", type: "paragraph", data: { text: "A midi dress with ankle boots is one of the most elegant autumn and winter looks. The boot heel and silhouette contrast beautifully with the flowing length of the dress, and the gap between the boot top and hemline creates a deliberate layering of proportions.<br/><br/><strong>For Kathmandu winters:</strong> Add opaque tights in black or neutral for warmth without disrupting the silhouette. A long cardigan or structured coat on top completes the look for colder days.<br/><br/><strong>Boot choices that work:</strong><br/>• Black Chelsea ankle boots — the most versatile<br/>• Brown or tan leather ankle boots — warmer, more relaxed<br/>• Heeled ankle boots for a dressier version<br/><br/>Floral and printed midi dresses work particularly well with dark ankle boots — the contrast between the feminine print and the sturdy boot creates visual interest." } },

    { id: "b_h2_4", type: "heading", data: { level: 2, text: "4. Belted at the Waist: Adding Shape and Definition" } },
    { id: "b_p_4", type: "paragraph", data: { text: "Many midi dresses — particularly slip-style, flowing, or loose-cut versions — benefit enormously from a belt. Adding a thin leather belt at the natural waist transforms the silhouette from undefined to deliberately shaped.<br/><br/><strong>Belt choices:</strong><br/>• A thin leather belt in the same colour family as the dress (tonal) for a subtle effect<br/>• A contrasting leather belt for a stronger visual statement<br/>• A fabric or ribbon tie belt for a softer, more romantic look<br/><br/>Belting also allows you to half-tuck or fully tuck any layers you add on top (a shirt, a knit) creating more complex outfit combinations from a simple dress base." } },

    { id: "b_h2_5", type: "heading", data: { level: 2, text: "5. With an Oversized Knit or Cardigan: Cosy and Considered" } },
    { id: "b_p_5", type: "paragraph", data: { text: "Layering an oversized knit or long cardigan over a midi dress is one of the most comfortable and visually interesting outfit combinations — particularly for cooler months in Kathmandu.<br/><br/>The key to making this work: let the dress hem peek out below the knit or cardigan. The contrast between the cosy, relaxed layer on top and the flowing dress underneath creates a deliberate, stylish proportion.<br/><br/><strong>Best combinations:</strong><br/>• A chunky cream knit over a floral midi dress<br/>• A camel cardigan over a simple black slip dress<br/>• An oversized grey knit over a printed midi<br/><br/>Add simple flat boots or sneakers to complete the look. This combination is perfect for days that start cool and warm up — you can remove the knit layer as the afternoon gets warmer." } },

    { id: "b_h2_6", type: "heading", data: { level: 2, text: "6. With Heels and Minimal Jewellery: The Evening Look" } },
    { id: "b_p_6", type: "paragraph", data: { text: "A midi dress already has an inherently elegant silhouette. For evening occasions, all it needs is the right shoes and a considered jewellery choice — minimal intervention creates the maximum impact.<br/><br/><strong>The evening midi formula:</strong><br/>• Strappy heeled sandals in gold, silver, nude, or a complementary colour<br/>• One statement accessory — dramatic earrings, a simple necklace, or a sleek clutch<br/>• Hair swept up or back to expose the neckline<br/><br/>For date nights, dinners, or semi-formal events, a well-chosen midi dress with heels and one piece of considered jewellery will almost always look more intentional and elegant than a more complex outfit." } },

    { id: "b_h2_7", type: "heading", data: { level: 2, text: "7. With a Denim Jacket: Weekend Casual With Interest" } },
    { id: "b_p_7", type: "paragraph", data: { text: "A denim jacket over a midi dress is one of the most reliable casual weekend outfit combinations — particularly for days when you want to look effortless but considered.<br/><br/>The denim jacket's structure and casual weight contrast beautifully with a flowing or satin midi dress, creating a deliberate tension between dressy and casual that reads as stylish rather than mismatched.<br/><br/><strong>Works best with:</strong><br/>• Slip dresses and satin midi dresses<br/>• Floral or printed midi dresses<br/>• A solid-coloured midi in a warm or neutral tone<br/><br/>Leave the jacket slightly open and roll the cuffs once or twice. Add white sneakers or simple flat sandals, a small shoulder bag, and minimal jewellery. This is an outfit you can wear from morning to evening without changing." } },

    { id: "b_h2_conclusion", type: "heading", data: { level: 2, text: "The Midi Dress: One Piece, Countless Outfits" } },
    { id: "b_p_conclusion", type: "paragraph", data: { text: "The midi dress is genuinely one of the most versatile pieces in a wardrobe — not because it is a neutral that disappears into every outfit, but because it is a strong enough foundation that different layers, shoes, and accessories can completely change what it communicates.<br/><br/>If you own one midi dress that you love and wear only one way, try one of the combinations above this week. The same dress will feel new without buying anything new." } },

    { id: "b_divider_1", type: "divider", data: {} },
    { id: "b_faq_1", type: "faq", data: { question: "What shoes go best with a midi dress?", answer: "White sneakers for casual looks, ankle boots for autumn and winter, strappy heeled sandals for evenings, and simple flats for everyday. Each shoe choice creates a completely different mood from the same dress." } },
    { id: "b_faq_2", type: "faq", data: { question: "Can you wear a midi dress to the office?", answer: "Yes — a midi dress in a solid colour or subtle print paired with a blazer and simple heels or flats is appropriate for most office environments. The midi length is inherently professional and comfortable for long workdays." } },
    { id: "b_faq_3", type: "faq", data: { question: "How do you make a midi dress look casual?", answer: "Add white sneakers and a denim jacket. This immediately drops the formality of the midi length and creates an effortless casual look. A small shoulder bag and minimal jewellery complete it." } },
    { id: "b_faq_4", type: "faq", data: { question: "What do you wear under a midi dress in cold weather?", answer: "Opaque tights (black or neutral) add warmth without disrupting the silhouette. Layer an oversized knit or cardigan on top, or a structured coat over everything. Ankle boots also add warmth at the foot." } },
    { id: "b_faq_5", type: "faq", data: { question: "What is the most flattering midi dress silhouette?", answer: "A wrap-style or A-line midi is the most universally flattering — both define the waist and allow the skirt to skim rather than cling. Slip-style and straight-cut midis are also popular and work well for most body types." } },
  ]

  return upsertPost({
    slug: "how-to-style-midi-dress",
    title: "How to Wear a Midi Dress: 7 Styling Ideas That Work for Any Occasion",
    excerpt: "One midi dress, seven completely different outfits. Here is how to style a midi dress for casual days, office, evenings, and everything in between.",
    body: blocks, coverImage: cover, gallery: [cover], authorId, categoryId,
    workflowState: "PUBLISHED", visibility: "PUBLIC", isFeatured: false, allowComments: true,
    readingTimeOverride: 7, locale: "en",
    seoTitle: "How to Style a Midi Dress: 7 Outfit Ideas for Every Occasion",
    metaDescription: "Learn how to style a midi dress 7 different ways — from casual sneakers to office blazers, evening heels, ankle boots, and layered knits.",
    canonicalUrl: "/journal/how-to-style-midi-dress",
    ogTitle: "How to Wear a Midi Dress: 7 Styling Ideas",
    ogDescription: "One midi dress, seven completely different outfits — for casual days, the office, evenings, and everything in between.",
    ogImage: cover, twitterTitle: "7 Ways to Style a Midi Dress",
    twitterDescription: "One midi dress styled 7 ways — sneakers, blazers, boots, belts, knits, heels, and denim.",
    twitterImage: cover, robotsIndex: true, robotsFollow: true,
    focusKeyword: "how to style a midi dress", publishedAt: new Date(), updatedAt: new Date(),
  }, tagIds, authorId)
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log("🚀 Batch import: 4 articles\n")

  const [adminUser] = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1)
  if (!adminUser) throw new Error("No admin user found.")
  console.log(`👤 Author: ${adminUser.firstName} ${adminUser.lastName}\n`)

  const stylingCat = await ensureCategory("Styling Guides", "styling-guides", "Editorial guides and advice on styling, outfits, and building your personal wardrobe.")
  const seasonalCat = await ensureCategory("Seasonal Fashion", "seasonal-fashion", "Seasonal fashion guides and curated outfit recommendations for festivals and holidays.")

  console.log("\n── Article 1: Oversized Shirt ────────────────────")
  const p1 = await article1(adminUser.id, stylingCat.id)

  console.log("\n── Article 2: Office Outfits Kathmandu ───────────")
  const p2 = await article2(adminUser.id, stylingCat.id)

  console.log("\n── Article 3: Tihar Outfits ──────────────────────")
  const p3 = await article3(adminUser.id, seasonalCat.id)

  console.log("\n── Article 4: Midi Dress ─────────────────────────")
  const p4 = await article4(adminUser.id, stylingCat.id)

  console.log("\n✅ ALL 4 ARTICLES PUBLISHED")
  console.log(`  1. /journal/${p1.slug}`)
  console.log(`  2. /journal/${p2.slug}`)
  console.log(`  3. /journal/${p3.slug}`)
  console.log(`  4. /journal/${p4.slug}`)

  await sql.end()
}

main().catch((err) => {
  console.error("❌ Batch import failed:", err)
  process.exit(1)
})
