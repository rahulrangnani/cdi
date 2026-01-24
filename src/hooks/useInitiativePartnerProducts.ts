import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';

export type InitiativePartnerProductInsert = TablesInsert<'initiative_partner_products'>;

export const useSyncInitiativePartnerProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      initiativePartnerId,
      productIds,
    }: {
      initiativePartnerId: string;
      productIds: string[];
    }) => {
      // First, delete all existing product associations for this initiative partner
      const { error: deleteError } = await supabase
        .from('initiative_partner_products')
        .delete()
        .eq('initiative_partner_id', initiativePartnerId);

      if (deleteError) throw deleteError;

      // If no products selected, just return
      if (productIds.length === 0) return [];

      // Insert new product associations
      const insertData: InitiativePartnerProductInsert[] = productIds.map(
        (productId) => ({
          initiative_partner_id: initiativePartnerId,
          product_id: productId,
          usage_status: 'live',
        })
      );

      const { data, error: insertError } = await supabase
        .from('initiative_partner_products')
        .insert(insertData)
        .select();

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
      queryClient.invalidateQueries({ queryKey: ['initiative-partners'] });
    },
  });
};
