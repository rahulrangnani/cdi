Plan to fix the VKYC initiative back button without changing functionality:

1. **Root cause**
   - The bucket/category drill-down on the home page is stored only in React local state.
   - When you open an initiative, the route changes to `/initiatives/:id`.
   - Pressing back returns to `/`, but the home page remounts with default state, so it shows the bucket landing page instead of the previous category/list view.

2. **Make drill-down state part of browser history**
   - Update the home page to read and write URL query params for the current view:
     - selected bucket
     - selected category
     - selected product, if in product mode
     - journey/product mode
   - Example internal state URL shape:
     - `/?view=journey&bucket=...&bucketName=...&category=...&categoryName=...`
     - `/?view=product&product=...&productName=...&bucket=...&category=...`

3. **Update home page navigation handlers**
   - When clicking a bucket, category, or product, push the new state into the URL.
   - When using breadcrumb/back controls inside the home page, remove only the relevant deeper params.
   - This keeps browser back/forward aligned with what the user sees.

4. **Update initiative links**
   - Keep the existing initiative detail route and product filtering behavior.
   - Ensure the browser history entry before `/initiatives/:id` is the exact bucket/category page the user came from.

5. **Keep initiative back button simple and correct**
   - Keep the initiative page back button using browser history (`navigate(-1)`), because once the previous page state is URL-backed, it will return to the correct bucket/category view.
   - Add a safe fallback to `/` only if there is no previous in-app history.

6. **Verify**
   - Test: Home → bucket → category → VKYC initiative → back.
   - Expected: returns to the VKYC category/initiative list, not the bucket landing page.
   - Also test browser back/forward across bucket/category/product drill-downs.