const postgres = require('/Users/nagarro/.gemini/antigravity/scratch/xinvora/node_modules/postgres')

const sql = postgres('postgresql://postgres.taeqocxotdstjmqyjcub:%3F%262EmXw_j7.aCn%24@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres')

async function run() {
  try {
    console.log("Starting Bags collection database seeding...")

    // 1. Find active default price book
    const [priceBook] = await sql`select id from price_books where is_default = true limit 1`
    if (!priceBook) {
      throw new Error("No default price book found in database.")
    }
    console.log("Using Default Price Book:", priceBook.id)

    await sql.begin(async (tx) => {
      // 2. Clean up existing 'bags' category/collection products first
      await tx`delete from product_collections where collection_id = 'a32b2145-9e6e-4c8b-8d77-62f4b32a11cf'`
      await tx`delete from cart_items where variant_id in (select id from variants where product_id in (select id from products where category_id = '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a'))`
      await tx`delete from price_book_entries where variant_id in (select id from variants where product_id in (select id from products where category_id = '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a'))`
      await tx`delete from inventory where variant_id in (select id from variants where product_id in (select id from products where category_id = '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a'))`
      await tx`delete from variant_images where variant_id in (select id from variants where product_id in (select id from products where category_id = '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a'))`
      await tx`delete from product_images where product_id in (select id from products where category_id = '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a')`
      await tx`delete from variants where product_id in (select id from products where category_id = '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a')`
      await tx`delete from products where category_id = '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a'`
      await tx`delete from collections where id = 'a32b2145-9e6e-4c8b-8d77-62f4b32a11cf'`
      await tx`delete from categories where id = '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a'`

      console.log("Cleanup finished successfully.")

      // 3. Create category
      await tx`
        insert into categories (id, slug, name, description, is_active)
        values ('9e1c3123-5e7e-4b6b-8d99-52e6f42b322a', 'bags', 'Bags', 'Luxury leather bags and everyday totes', true)
      `
      console.log("Created Category 'bags'.")

      // 4. Create collection
      await tx`
        insert into collections (id, slug, name, description, is_active)
        values ('a32b2145-9e6e-4c8b-8d77-62f4b32a11cf', 'bags', 'Bags', 'Sculptural shapes and raw textures.', true)
      `
      console.log("Created Collection 'bags'.")

      // 5. Insert Product 1: Trapeze Tote
      const productId1 = '11c12145-9e6e-4c8b-8d77-62f4b32a0011'
      const variantId1 = '22c12145-9e6e-4c8b-8d77-62f4b32a0011'
      const imageUrl1 = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'

      await tx`
        insert into products (id, slug, name, description, category_id, status)
        values (${productId1}, 'trapeze-tote', 'Trapeze Tote', 'An architectural trapeze silhouette, crafted in ultra-premium dark leather with delicate top handles and structured lining.', '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a', 'PUBLISHED')
      `
      await tx`
        insert into product_images (product_id, url, position)
        values (${productId1}, ${imageUrl1}, 0)
      `
      await tx`
        insert into variants (id, product_id, sku, is_active)
        values (${variantId1}, ${productId1}, 'BAG-TOTE-BLK', true)
      `
      await tx`
        insert into variant_images (variant_id, url, position)
        values (${variantId1}, ${imageUrl1}, 0)
      `
      await tx`
        insert into price_book_entries (price_book_id, variant_id, price)
        values (${priceBook.id}, ${variantId1}, 95000)
      `
      await tx`
        insert into inventory (variant_id, quantity)
        values (${variantId1}, 25)
      `
      await tx`
        insert into product_collections (product_id, collection_id)
        values (${productId1}, 'a32b2145-9e6e-4c8b-8d77-62f4b32a11cf')
      `
      console.log("Seeded Product 1: Trapeze Tote.")

      // 6. Insert Product 2: Editorial Sling
      const productId2 = '11c12145-9e6e-4c8b-8d77-62f4b32a0022'
      const variantId2 = '22c12145-9e6e-4c8b-8d77-62f4b32a0022'
      const imageUrl2 = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800'

      await tx`
        insert into products (id, slug, name, description, category_id, status)
        values (${productId2}, 'editorial-sling', 'Editorial Sling', 'A structural leather cross-body sling bag, featuring an asymmetric silhouette, raw-cut edges, and an adjustable wide strap.', '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a', 'PUBLISHED')
      `
      await tx`
        insert into product_images (product_id, url, position)
        values (${productId2}, ${imageUrl2}, 0)
      `
      await tx`
        insert into variants (id, product_id, sku, is_active)
        values (${variantId2}, ${productId2}, 'BAG-SLING-BRN', true)
      `
      await tx`
        insert into variant_images (variant_id, url, position)
        values (${variantId2}, ${imageUrl2}, 0)
      `
      await tx`
        insert into price_book_entries (price_book_id, variant_id, price)
        values (${priceBook.id}, ${variantId2}, 65000)
      `
      await tx`
        insert into inventory (variant_id, quantity)
        values (${variantId2}, 35)
      `
      await tx`
        insert into product_collections (product_id, collection_id)
        values (${productId2}, 'a32b2145-9e6e-4c8b-8d77-62f4b32a11cf')
      `
      console.log("Seeded Product 2: Editorial Sling.")

      // 7. Insert Product 3: Overnight Duffel
      const productId3 = '11c12145-9e6e-4c8b-8d77-62f4b32a0033'
      const variantId3 = '22c12145-9e6e-4c8b-8d77-62f4b32a0033'
      const imageUrl3 = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'

      await tx`
        insert into products (id, slug, name, description, category_id, status)
        values (${productId3}, 'overnight-duffel', 'Overnight Duffel', 'A spacious weekend travel bag in soft pebbled leather, complete with dual hand grips, durable brass hardware, and double interior slip compartments.', '9e1c3123-5e7e-4b6b-8d99-52e6f42b322a', 'PUBLISHED')
      `
      await tx`
        insert into product_images (product_id, url, position)
        values (${productId3}, ${imageUrl3}, 0)
      `
      await tx`
        insert into variants (id, product_id, sku, is_active)
        values (${variantId3}, ${productId3}, 'BAG-DUFFEL-BLK', true)
      `
      await tx`
        insert into variant_images (variant_id, url, position)
        values (${variantId3}, ${imageUrl3}, 0)
      `
      await tx`
        insert into price_book_entries (price_book_id, variant_id, price)
        values (${priceBook.id}, ${variantId3}, 120000)
      `
      await tx`
        insert into inventory (variant_id, quantity)
        values (${variantId3}, 15)
      `
      await tx`
        insert into product_collections (product_id, collection_id)
        values (${productId3}, 'a32b2145-9e6e-4c8b-8d77-62f4b32a11cf')
      `
      console.log("Seeded Product 3: Overnight Duffel.")
    })

    console.log("All bags data seeded successfully!")
    await sql.end()
    process.exit(0)
  } catch (error) {
    console.error("Database seeding failed:")
    console.error(error)
    await sql.end()
    process.exit(1)
  }
}

run()
