
## Goal

Introduce a third level — **Bucket** — above the existing Main Category → Sub-initiative hierarchy, giving us:

```text
Bucket  →  Main Category  →  Sub-initiative (Initiative with partners)
```

Existing IDs, names, and partner links are preserved. Admins and users get a new top layer to navigate; nothing about partners or sub-initiatives changes.

## Approach: reuse the self-referencing `initiatives` table

The `initiatives` table already supports arbitrary depth via `parent_id` (self-FK). Today we only use 2 levels. We'll:

- Keep the same table and columns.
- Introduce a `level` marker so we can render/validate the tier without guessing.
- Treat rows where `parent_id IS NULL` as **Buckets** going forward.
- Main categories become children of a bucket.
- Sub-initiatives remain children of a main category (unchanged).

This is the cleanest option: no new tables, no new joins, existing partner links via `initiative_partners.initiative_id` continue to work.

### Schema change (single migration)

1. Add `level TEXT NOT NULL DEFAULT 'initiative'` to `initiatives` with allowed values via CHECK: `'bucket' | 'category' | 'initiative'`.
2. Backfill:
   - Every current top-level row (`parent_id IS NULL`) → `level = 'category'`.
   - Every current child row → `level = 'initiative'`.
3. Create one default bucket row (e.g. name `"General"`, `level = 'bucket'`, `parent_id = NULL`).
4. Re-parent every existing `level = 'category'` row to that default bucket (set their `parent_id` to the new bucket's id).
5. Add a trigger (or CHECK on a helper function) that enforces:
   - `bucket` rows must have `parent_id IS NULL`.
   - `category` rows must have a `bucket` parent.
   - `initiative` rows must have a `category` parent (or remain top-level only during migration — we'll require category parent post-migration).

Existing IDs of categories and sub-initiatives are untouched. Only their `parent_id` for the category rows changes (from NULL → default bucket id).

## Data model diagram

```text
initiatives (id, name, parent_id, level, status, ...)
  level = 'bucket'      parent_id NULL
    └─ level = 'category'   parent_id = bucket.id
         └─ level = 'initiative' parent_id = category.id
              └─ initiative_partners (unchanged)
```

## Retrieval / API changes

All reads still go through the same table; we just filter by `level`.

- `useInitiatives({ parentId: null })` today returns "main categories". After migration this returns **buckets**. Update the hook to accept an optional `level` filter, defaulting to backwards-compatible behavior where possible.
- Add helpers:
  - `useBuckets()` → `level='bucket'`.
  - `useCategories(bucketId)` → children of a bucket.
  - `useSubInitiatives(categoryId)` → unchanged (children of a category).

No changes needed to `initiative_partners`, `partners`, features, products, API docs, support — those attach to the leaf `initiative` row and continue to work.

## UI changes

### Portal home (`src/pages/Index.tsx`)
- Landing view now lists **Buckets** (cards).
- Click a bucket → list its **Main Categories** (existing category card look).
- Click a category → list its **Sub-initiatives** (existing behavior, unchanged).
- Breadcrumb becomes: `All Buckets → {Bucket} → {Category}`.
- The "initiatives without partners at bottom" sort continues to apply at the sub-initiative level.

### Admin
- `AdminLayout` nav: add **Buckets** entry above **Initiatives**.
- New pages: `BucketsManagement` + `BucketForm` (mirrors existing category flow).
- `InitiativesManagement` / `CategoryForm`: main-category form gets a required "Bucket" dropdown.
- `InitiativeForm` (sub-initiative): unchanged aside from breadcrumb text.

## Backward compatibility

- All existing category/sub-initiative IDs and names preserved → existing deep links like `/initiatives/:id` keep working.
- All `initiative_partners`, features, products, API docs, media, support rows are untouched (still keyed to the same initiative id).
- Any query that previously did `parent_id IS NULL` to fetch "top level" must be updated — the new "top level" is `level='bucket'`. Locations to update:
  - `src/hooks/useInitiatives.ts`
  - `src/pages/Index.tsx`
  - Admin category/initiative management pages
- To reduce churn, we can add a temporary shim: `useMainCategories()` returning `level='category'` regardless of bucket, for any legacy screen not yet migrated.

## Migration strategy (safe & reversible)

Single migration file executing in order:

1. `ALTER TABLE initiatives ADD COLUMN level TEXT`.
2. Backfill `level` from current shape (`parent_id IS NULL` → 'category', else 'initiative').
3. `INSERT` default bucket "General" with a fixed generated UUID captured in a CTE.
4. `UPDATE initiatives SET parent_id = <bucket_id> WHERE level = 'category'`.
5. `ALTER TABLE initiatives ALTER COLUMN level SET NOT NULL, ADD CONSTRAINT ... CHECK (level IN (...))`.
6. Add validation trigger enforcing parent/level rules.
7. RLS policies unchanged (same table, same access model). GRANTs unchanged.

Rollback: drop trigger + `level` column + re-null the default bucket's children's `parent_id`, delete the default bucket. All original ids remain intact.

## Files that will change

- `supabase/migrations/<new>.sql` — schema + backfill + trigger.
- `src/integrations/supabase/types.ts` — auto-regenerated after migration.
- `src/hooks/useInitiatives.ts` — add `level` filter, `useBuckets`, `useCategoriesByBucket`.
- `src/pages/Index.tsx` — three-step drill (Bucket → Category → Sub-initiative).
- `src/components/layout/AdminLayout.tsx` — add "Buckets" nav item.
- `src/pages/admin/BucketsManagement.tsx` + `BucketForm.tsx` — new.
- `src/pages/admin/InitiativesManagement.tsx` / `CategoryForm.tsx` — require bucket selection when creating a main category.
- `src/App.tsx` — routes for `/admin/buckets` and `/admin/buckets/new` etc.

## Out of scope

- Renaming domain terms elsewhere in the app.
- Any changes to partner-level data structures.
- Analytics, exports, or search indexing beyond the category tree.

Confirm and I'll implement in this order: migration → hooks → admin CRUD → portal navigation.
