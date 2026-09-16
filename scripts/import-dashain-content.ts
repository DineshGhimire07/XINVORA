// scripts/import-dashain-content.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import path from "path";
import { eq } from "drizzle-orm";
import { journalCategories, journalTags, journalPosts, journalPostTags, journalRevisions, users } from "../src/db/schema";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function importDashainContent() {
  console.log("🚀 Starting Dashain Outfits Content Package Import...");

  // 1. Get admin author
  const [adminUser] = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1);
  if (!adminUser) throw new Error("No admin user found in database to assign as author.");
  console.log(`👤 Using Author: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.id})`);

  // 2. Get or create Category: "Seasonal Fashion" (slug: "seasonal-fashion")
  let [category] = await db.select().from(journalCategories).where(eq(journalCategories.slug, "seasonal-fashion")).limit(1);
  if (!category) {
    console.log("📁 Category 'Seasonal Fashion' not found. Creating it...");
    const [newCat] = await db
      .insert(journalCategories)
      .values({
        name: "Seasonal Fashion",
        slug: "seasonal-fashion",
        description: "Seasonal fashion guides and curated outfit recommendations for festivals and holidays.",
      })
      .returning();
    category = newCat;
    console.log(`✅ Created category: ${category.name} (${category.id})`);
  } else {
    console.log(`📁 Found category: ${category.name} (${category.id})`);
  }

  // 3. Resolve tags for the article
  const tagNames = [
    "Dashain Fashion",
    "Nepali Fashion",
    "Festive Outfits",
    "Nepal Fashion",
    "Ethnic Wear",
    "Gen Z Fashion",
    "Women’s Fashion",
    "Festival Style",
  ];

  const tagIds: string[] = [];
  for (const name of tagNames) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    let [existingTag] = await db.select().from(journalTags).where(eq(journalTags.slug, slug)).limit(1);
    if (!existingTag) {
      const [newTag] = await db.insert(journalTags).values({ name, slug }).returning();
      existingTag = newTag;
    }
    tagIds.push(existingTag.id);
  }
  console.log(`🏷️ Resolved ${tagIds.length} tags.`);

  // 4. Structured Body Blocks – full article content
  const blocks = [
    {
      id: "b_intro_1",
      type: "paragraph",
      data: {
        text: "Dashain is one of those times when getting dressed feels like part of the celebration.<br/><br/>There are family gatherings, tika visits, meals that turn into long conversations, photos with cousins, and plenty of moments when you want an outfit that feels festive without looking like you are wearing the same thing every year.<br/><br/>The easiest approach is to find a balance between <strong>traditional details and modern styling</strong>. You do not need a heavily embellished outfit to look ready for Dashain. A well-cut kurta, a contemporary ethnic set, a festive dress with the right accessories, or even a simple coordinated outfit can work beautifully.<br/><br/>If you are looking for <strong>Dashain outfits in Nepal</strong>, here are practical looks to consider for different plans and personal styles."
      }
    },
    {
      id: "b_h2_1",
      type: "heading",
      data: { level: 2, text: "1. Start with a Modern Kurta Set" }
    },
    {
      id: "b_p_1",
      type: "paragraph",
      data: {
        text: "A kurta set is one of the easiest choices for Dashain.<br/><br/>It feels appropriate for family gatherings and tika while still giving you plenty of room to personalize the look. Instead of choosing an overly ornate design, try a clean silhouette in a festive colour.<br/><br/>Deep red, maroon, emerald, navy, mustard, chocolate brown, and warm neutrals can all create a seasonal feel. If your outfit is relatively simple, let the accessories do some of the work.<br/><br/>Try:<br/>• Straight kurta + matching pants + statement earrings<br/>• Short kurta + wide-leg trousers<br/>• Printed kurta + solid bottoms<br/>• Minimal kurta set + colourful dupatta<br/><br/>For a more contemporary finish, keep your hair and makeup relatively simple.<br/><br/><strong>The idea:</strong> let the outfit look intentional rather than over-styled."
      }
    },
    {
      id: "b_img_1",
      type: "image",
      data: {
        urls: ["/images/dashain-outfits-nepal-cover.jpg"],
        caption: "A modern kurta set in a deep festive colour is one of the most versatile Dashain outfit choices.",
        alt: "Young Nepali woman in a modern festive outfit styled for Dashain"
      }
    },
    {
      id: "b_h2_2",
      type: "heading",
      data: { level: 2, text: "2. Make a Co-Ord Set Feel Festive" }
    },
    {
      id: "b_p_2",
      type: "paragraph",
      data: {
        text: "If traditional clothing is not really your everyday style, a co-ord can be a great alternative.<br/><br/>Choose a matching top-and-bottom combination in a richer fabric, deeper colour, or interesting print. Then add festive accessories to shift the outfit from everyday to celebration-ready.<br/><br/>For example, a simple monochrome co-ord can work with:<br/>• Gold-toned earrings<br/>• A small shoulder bag<br/>• Heeled sandals or flats<br/>• A sleek hairstyle<br/>• One statement ring<br/><br/>This works particularly well for younger women who want their Dashain look to feel modern rather than strictly traditional.<br/><br/>The trick is <strong>styling, not piling on accessories</strong>."
      }
    },
    {
      id: "b_h2_3",
      type: "heading",
      data: { level: 2, text: "3. Wear a Saree Without Making It Feel Too Formal" }
    },
    {
      id: "b_p_3",
      type: "paragraph",
      data: {
        text: "A saree does not have to mean a very formal, heavily decorated look.<br/><br/>For a more youthful approach, try a simpler saree with a contemporary blouse. You can also experiment with the way you style the rest of the outfit.<br/><br/>A plain saree paired with a structured blouse can look striking with minimal jewellery. Alternatively, a printed saree can be paired with a simple blouse and understated accessories.<br/><br/>If you are attending several family events, consider your comfort too. A saree that looks beautiful but requires constant adjusting may not be the most practical choice for a full day of visiting relatives.<br/><br/>Choose a drape and footwear that allow you to move comfortably."
      }
    },
    {
      id: "b_h2_4",
      type: "heading",
      data: { level: 2, text: "4. Try a Festive Dress" }
    },
    {
      id: "b_p_4",
      type: "paragraph",
      data: {
        text: "Dashain dressing does not have to be limited to ethnic wear.<br/><br/>A midi or maxi dress can work for celebrations, dinners, casual family gatherings, and evenings with friends. To make it feel more festive, focus on colour, texture, and accessories.<br/><br/>A simple dress can become a Dashain-ready outfit with festive footwear and statement earrings.<br/><br/>Look for silhouettes that feel polished without being overly complicated. A wrap-style dress, fitted midi, flowing maxi, or structured mini can all work depending on the occasion.<br/><br/>If you are visiting family for tika, you may want to choose a more modest neckline and comfortable length. For an evening gathering with friends, you can make the styling more fashion-forward."
      }
    },
    {
      id: "b_callout_1",
      type: "callout",
      data: {
        title: "Simple Formula",
        text: "Dress + earrings + small bag + festive footwear can turn a simple dress into a celebration-ready Dashain look.",
        type: "info"
      }
    },
    {
      id: "b_h2_5",
      type: "heading",
      data: { level: 2, text: "5. Build Your Look Around a Dupatta" }
    },
    {
      id: "b_p_5",
      type: "paragraph",
      data: {
        text: "Sometimes you do not need a completely new outfit.<br/><br/>A colourful or embellished dupatta can change the appearance of a simple kurta, top, or coordinated outfit. This is especially useful if you prefer buying versatile pieces rather than clothing that only comes out once a year.<br/><br/>Try contrasting combinations such as:<br/>• Ivory outfit + deep red dupatta<br/>• Black outfit + jewel-toned dupatta<br/>• Neutral beige + mustard<br/>• Navy + pink<br/>• Chocolate brown + warm orange<br/><br/>Keep the rest of your styling relatively restrained so the dupatta becomes the focal point."
      }
    },
    {
      id: "b_h2_6",
      type: "heading",
      data: { level: 2, text: "6. Choose a Look for Tika Day" }
    },
    {
      id: "b_p_6",
      type: "paragraph",
      data: {
        text: "Tika day is usually the moment when your outfit gets the most attention.<br/><br/>You may be sitting with family, moving between homes, taking photographs, eating, and spending several hours in your outfit. That makes comfort just as important as appearance.<br/><br/>For a tika-day outfit, consider a comfortable silhouette in a breathable fabric, with practical footwear and simple jewellery.<br/><br/>A relaxed kurta set is an easy choice. A modest midi dress with traditional accessories can also work if you prefer contemporary clothing.<br/><br/>Avoid choosing something simply because it photographs well. If the outfit is uncomfortable after an hour, you will probably notice it more than anyone else."
      }
    },
    {
      id: "b_h2_7",
      type: "heading",
      data: { level: 2, text: "7. Dress Up a Simple Outfit With Jewellery" }
    },
    {
      id: "b_p_7",
      type: "paragraph",
      data: {
        text: "You can keep your clothing minimal and still create a festive look.<br/><br/>Gold-toned earrings, hoops, jhumkas, layered necklaces, bangles, or a statement ring can completely change a simple outfit.<br/><br/>If your neckline already has detail, focus on earrings instead of adding a necklace. If your outfit is plain, a necklace or stacked bangles can become the focal point.<br/><br/>A useful rule is to choose <strong>one main accessory moment</strong>.<br/><br/>You do not need statement earrings, a large necklace, multiple bangles, and an elaborate bag all at once."
      }
    },
    {
      id: "b_h2_8",
      type: "heading",
      data: { level: 2, text: "8. Don't Forget the Shoes" }
    },
    {
      id: "b_p_8",
      type: "paragraph",
      data: {
        text: "Festive outfits are often planned from head to waist, and shoes are added at the last minute. That can be a mistake.<br/><br/>Dashain often involves visiting different homes, standing around, sitting on the floor, walking outside, and spending long periods on your feet. Your shoes should match the practical reality of the day.<br/><br/>Consider:<br/>• Low block heels<br/>• Dressy flats<br/>• Minimal sandals<br/>• Clean sneakers for casual looks<br/>• Comfortable traditional-inspired footwear<br/><br/>If your outfit is heavily detailed, simple footwear can keep the overall look balanced."
      }
    },
    {
      id: "b_h2_9",
      type: "heading",
      data: { level: 2, text: "9. Use Autumn Colours Without Following a Strict Palette" }
    },
    {
      id: "b_p_9",
      type: "paragraph",
      data: {
        text: "Dashain arrives during a season when the weather and atmosphere can make richer colours especially appealing. But you do not have to dress entirely in traditional festive shades.<br/><br/>Try combining one rich colour with neutrals. For example:<br/><br/>• Maroon + cream<br/>• Emerald + beige<br/>• Mustard + brown<br/>• Navy + gold<br/>• Burgundy + black<br/><br/>A single deep colour paired with a neutral base can look contemporary and festive without feeling overdone."
      }
    },
    {
      id: "b_callout_2",
      type: "callout",
      data: {
        title: "Festive Colour Pairings",
        text: "Maroon + cream · Emerald + beige · Mustard + brown · Navy + gold · Burgundy + black. One rich shade paired with a neutral creates a festive feel without overpowering the look.",
        type: "info"
      }
    },
    {
      id: "b_h2_10",
      type: "heading",
      data: { level: 2, text: "10. Make One Outfit Work for Multiple Dashain Plans" }
    },
    {
      id: "b_p_10",
      type: "paragraph",
      data: {
        text: "A versatile outfit can be restyled with different jewellery, footwear, bags, and accessories for family visits in the morning and evenings with friends.<br/><br/>For example, a kurta set or co-ord can look more formal with heels, a structured bag, and statement earrings for tika day. The same outfit can look more relaxed for a later gathering with lighter accessories and casual footwear.<br/><br/>Thinking about how an outfit can adapt throughout the day can help you get more from what you already have."
      }
    },
    {
      id: "b_h2_conclusion",
      type: "heading",
      data: { level: 2, text: "The Best Dashain Outfit Is One That Feels Like You" }
    },
    {
      id: "b_p_conclusion",
      type: "paragraph",
      data: {
        text: "There is no single formula for Dashain outfits in Nepal. Traditional and contemporary pieces can work equally well when they reflect your personal style and suit the occasion.<br/><br/>Modern Dashain dressing can combine the pieces, colours, and styling details you love with traditions that make the festival meaningful."
      }
    },
    {
      id: "b_quote_1",
      type: "quote",
      data: {
        text: "What do I actually want to feel comfortable and confident wearing all day?",
        caption: "The right question to ask before choosing any Dashain outfit."
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
        question: "What should I wear for Dashain in Nepal?",
        answer: "A kurta set, saree, festive dress, co-ord, or contemporary ethnic outfit can all work for Dashain. Choose based on the event, your comfort, and your personal style."
      }
    },
    {
      id: "b_faq_2",
      type: "faq",
      data: {
        question: "What are good colours for a Dashain outfit?",
        answer: "Deep red, maroon, emerald, mustard, navy, burgundy, brown, cream, and warm neutrals can create a festive feel. You can also use softer colours and add traditional accessories."
      }
    },
    {
      id: "b_faq_3",
      type: "faq",
      data: {
        question: "Can I wear a western dress for Dashain?",
        answer: "Yes. A midi or maxi dress can work for many Dashain occasions. Festive colours, jewellery, and accessories can give a contemporary dress a more celebratory feel."
      }
    },
    {
      id: "b_faq_4",
      type: "faq",
      data: {
        question: "What should I wear for Dashain tika day?",
        answer: "Choose something comfortable enough for several hours of family gatherings and movement. A relaxed kurta set, modest dress, or contemporary ethnic outfit can work well."
      }
    },
    {
      id: "b_faq_5",
      type: "faq",
      data: {
        question: "How can I make a simple outfit look festive?",
        answer: "Use one or two strong styling details such as statement earrings, a colourful dupatta, festive footwear, or a small structured bag rather than adding many accessories at once."
      }
    }
  ];

  const postSlug = "best-dashain-outfits-nepal";
  const coverImageUrl = "/images/dashain-outfits-nepal-cover.jpg"; // ensure image is in public/images

  const postData = {
    slug: postSlug,
    title: "Best Outfits for Dashain in Nepal: Modern Looks to Wear This Festive Season",
    excerpt: "From family gatherings to tika day, discover modern Dashain outfits that balance Nepali tradition with contemporary personal style.",
    body: blocks,
    coverImage: coverImageUrl,
    gallery: [coverImageUrl],
    authorId: adminUser.id,
    categoryId: category.id,
    workflowState: "PUBLISHED",
    visibility: "PUBLIC",
    isFeatured: true,
    allowComments: true,
    locale: "en",
    seoTitle: "Best Dashain Outfits in Nepal: Modern Style Guide",
    metaDescription: "Discover stylish Dashain outfits in Nepal, from modern kurtas to festive dresses, with easy ideas for tika, family gatherings, and celebrations.",
    canonicalUrl: `/journal/${postSlug}`,
    ogTitle: "Best Dashain Outfits in Nepal: Modern Style Guide",
    ogDescription: "Discover stylish Dashain outfits in Nepal, from modern kurtas to festive dresses, with easy ideas for tika, family gatherings, and celebrations.",
    ogImage: coverImageUrl,
    twitterTitle: "Best Dashain Outfits in Nepal: Modern Style Guide",
    twitterDescription: "Discover stylish Dashain outfits in Nepal, from modern kurtas to festive dresses, with easy ideas for tika, family gatherings, and celebrations.",
    twitterImage: coverImageUrl,
    robotsIndex: true,
    robotsFollow: true,
    focusKeyword: "Dashain outfits in Nepal",
    publishedAt: new Date(),
    updatedAt: new Date(),
  };

  // 5. Upsert Post
  const [existing] = await db.select().from(journalPosts).where(eq(journalPosts.slug, postSlug)).limit(1);
  let savedPost: any;
  if (existing) {
    console.log(`🔄 Existing post found (${existing.id}). Updating...`);
    const [updated] = await db.update(journalPosts).set(postData).where(eq(journalPosts.id, existing.id)).returning();
    savedPost = updated;
  } else {
    console.log(`✨ Creating new post...`);
    const [inserted] = await db.insert(journalPosts).values(postData).returning();
    savedPost = inserted;
  }

  // 6. Link Tags
  await db.delete(journalPostTags).where(eq(journalPostTags.postId, savedPost.id));
  for (const tagId of tagIds) {
    await db.insert(journalPostTags).values({ postId: savedPost.id, tagId }).onConflictDoNothing();
  }

  // 7. Create initial revision snapshot
  await db.insert(journalRevisions).values({
    postId: savedPost.id,
    revisionData: postData,
    changedById: adminUser.id,
  });

  console.log(`\n🎉 Dashain Content Package Successfully Imported!`);
  console.log(`📄 ID: ${savedPost.id}`);
  console.log(`🔗 Slug: /journal/${savedPost.slug}`);
  console.log(`📊 State: ${savedPost.workflowState}`);
  console.log(`🏷️ Tags: ${tagNames.join(", ")}`);

  await sql.end();
}

importDashainContent().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
