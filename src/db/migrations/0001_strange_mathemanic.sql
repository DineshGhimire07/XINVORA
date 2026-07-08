ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_id_carts_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_variant_id_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_brand_id_brands_id_fk";
--> statement-breakpoint
ALTER TABLE "variants" DROP CONSTRAINT "variants_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "variants" DROP CONSTRAINT "variants_color_id_colors_id_fk";
--> statement-breakpoint
ALTER TABLE "variants" DROP CONSTRAINT "variants_size_id_sizes_id_fk";
--> statement-breakpoint
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_tags" DROP CONSTRAINT "product_tags_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_tags" DROP CONSTRAINT "product_tags_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "product_collections" DROP CONSTRAINT "product_collections_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_collections" DROP CONSTRAINT "product_collections_collection_id_collections_id_fk";
--> statement-breakpoint
ALTER TABLE "product_materials" DROP CONSTRAINT "product_materials_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_materials" DROP CONSTRAINT "product_materials_material_id_materials_id_fk";
--> statement-breakpoint
ALTER TABLE "variant_images" DROP CONSTRAINT "variant_images_variant_id_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_variant_id_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "price_book_entries" DROP CONSTRAINT "price_book_entries_price_book_id_price_books_id_fk";
--> statement-breakpoint
ALTER TABLE "price_book_entries" DROP CONSTRAINT "price_book_entries_variant_id_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_wishlist_id_wishlists_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_variant_id_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_variant_id_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_color_id_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_size_id_sizes_id_fk" FOREIGN KEY ("size_id") REFERENCES "public"."sizes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_book_entries" ADD CONSTRAINT "price_book_entries_price_book_id_price_books_id_fk" FOREIGN KEY ("price_book_id") REFERENCES "public"."price_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_book_entries" ADD CONSTRAINT "price_book_entries_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_wishlists_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "variants_product_id_idx" ON "variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "variants_color_id_idx" ON "variants" USING btree ("color_id");--> statement-breakpoint
CREATE INDEX "variants_size_id_idx" ON "variants" USING btree ("size_id");--> statement-breakpoint
CREATE INDEX "product_images_product_id_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_tags_product_id_idx" ON "product_tags" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_collections_product_id_idx" ON "product_collections" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_collections_collection_id_idx" ON "product_collections" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "product_materials_product_id_idx" ON "product_materials" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "variant_images_variant_id_idx" ON "variant_images" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "price_book_entries_variant_id_idx" ON "price_book_entries" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");