import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PartnerFeature {
  id: string;
  initiative_partner_id: string;
  feature_name: string;
  is_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const usePartnerFeatures = (initiativePartnerId?: string) => {
  return useQuery({
    queryKey: ['partner_features', initiativePartnerId],
    queryFn: async () => {
      let query = supabase.from('partner_features').select('*').order('feature_name');
      if (initiativePartnerId) {
        query = query.eq('initiative_partner_id', initiativePartnerId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as PartnerFeature[];
    },
    enabled: !!initiativePartnerId,
  });
};

export const useUpsertPartnerFeatures = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      initiativePartnerId,
      features,
    }: {
      initiativePartnerId: string;
      features: { feature_name: string; is_available: boolean; notes?: string }[];
    }) => {
      // Delete existing features for this partner
      const { error: deleteError } = await supabase
        .from('partner_features')
        .delete()
        .eq('initiative_partner_id', initiativePartnerId);
      if (deleteError) throw deleteError;

      if (features.length === 0) return [];

      // Insert new features
      const { data, error } = await supabase
        .from('partner_features')
        .insert(features.map((f) => ({ ...f, initiative_partner_id: initiativePartnerId })))
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partner_features', variables.initiativePartnerId] });
    },
  });
};
