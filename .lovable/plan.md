## Add Product-wise view toggle on Home page

Add a top-level view switcher on the portal home so users can browse either by **Journey** (current bucket → category → initiative drill) or by **Product** (product → filtered bucket drill).

### UX flow

```text
Home
 ├── [ Journey view | Product view ]  ← toggle
 │
 ├── Journey view (unchanged)
 │     Buckets → Categories → Initiatives → Partners
 │
 └── Product view (new)
       Step 1: Grid of Products (from `products` table, active only)
       Step 2: After picking a product → same Bucket → Category → Initiative drill,
               but every level is filtered to only show nodes that contain at least
               one partner linked to that product (via initiative_partner_products).
               A "Product: {name} ✕" chip stays visible; clicking ✕ returns to Step 1.
               On the Initiative detail page reached from this path, only partners
               linked to the selected product are shown (filter passed via query param).
```

### Filtering logic

A bucket/category/initiative is "in" the product view if it has any descendant `initiative_partner` whose `initiative_partner_products.product_id` matches the selected product.

New hook `useProductScopedTree(productId)` runs one query:

1. `initiative_partner_products` filtered by `product_id` → get `initiative_partner_id` list.
2. `initiative_partners` for those → get `initiative_id` list (these are level=`initiative`).
3. `initiatives` self-join up to `category` then `bucket` to derive the allowed id sets at each level.

Existing `useBuckets` / `useCategoriesByBucket` / `useSubInitiatives` accept an optional `allowedIds: Set<string>` prop and filter client-side; when omitted, behavior is unchanged (Journey view untouched).

### Initiative detail filtering

`InitiativeDetail.tsx` reads `?product=<id>` from the URL. When present:
- Filter the partners list to those with a matching `initiative_partner_products` row.
- Show a "Filtered by product: {name} ✕" chip; ✕ removes the query param.

### Files to change

- `src/hooks/useInitiatives.ts` — add optional `allowedIds` filter to `useBuckets`, `useCategoriesByBucket`, `useSubInitiatives`.
- `src/hooks/useProductScopedTree.ts` — **new**, resolves allowed bucket/category/initiative id sets for a product.
- `src/pages/Index.tsx` — add view mode toggle (`journey` | `product`), product picker step, wire allowed-id sets into existing drill components, pass `?product=` on initiative links in product mode.
- `src/pages/InitiativeDetail.tsx` — read `?product=` and filter partners + show chip.

No database or admin changes. Journey view remains pixel-identical when the toggle is on "Journey".
