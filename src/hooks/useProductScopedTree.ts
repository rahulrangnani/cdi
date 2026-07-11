import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ProductScopedTree = {
  initiativeIds: Set<string>;
  categoryIds: Set<string>;
  bucketIds: Set<string>;
  initiativePartnerIds: Set<string>;
};

/**
 * For a given product, resolve which initiatives / categories / buckets contain
 * at least one partner linked to that product. Used to filter the home-page
 * drill-down in "Product view".
 */
export const useProductScopedTree = (productId: string | null | undefined) => {
  return useQuery<ProductScopedTree>({
    queryKey: ['product-scoped-tree', productId],
    enabled: !!productId,
    queryFn: async () => {
      // 1) initiative_partner rows linked to this product
      const { data: ipp, error: ippErr } = await supabase
        .from('initiative_partner_products')
        .select('initiative_partner_id')
        .eq('product_id', productId!);
      if (ippErr) throw ippErr;

      const initiativePartnerIds = new Set((ipp || []).map((r) => r.initiative_partner_id));
      if (initiativePartnerIds.size === 0) {
        return {
          initiativePartnerIds,
          initiativeIds: new Set<string>(),
          categoryIds: new Set<string>(),
          bucketIds: new Set<string>(),
        };
      }

      // 2) initiative ids for those initiative_partners
      const { data: ips, error: ipsErr } = await supabase
        .from('initiative_partners')
        .select('initiative_id')
        .in('id', Array.from(initiativePartnerIds));
      if (ipsErr) throw ipsErr;

      const initiativeIds = new Set((ips || []).map((r) => r.initiative_id));
      if (initiativeIds.size === 0) {
        return { initiativePartnerIds, initiativeIds, categoryIds: new Set(), bucketIds: new Set() };
      }

      // 3) walk up: initiative → category → bucket via parent_id
      const { data: initRows, error: initErr } = await supabase
        .from('initiatives')
        .select('id, parent_id')
        .in('id', Array.from(initiativeIds));
      if (initErr) throw initErr;

      const categoryIds = new Set(
        (initRows || []).map((r) => r.parent_id).filter((x): x is string => !!x)
      );

      let bucketIds = new Set<string>();
      if (categoryIds.size > 0) {
        const { data: catRows, error: catErr } = await supabase
          .from('initiatives')
          .select('id, parent_id')
          .in('id', Array.from(categoryIds));
        if (catErr) throw catErr;
        bucketIds = new Set(
          (catRows || []).map((r) => r.parent_id).filter((x): x is string => !!x)
        );
      }

      return { initiativePartnerIds, initiativeIds, categoryIds, bucketIds };
    },
  });
};
