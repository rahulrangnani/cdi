import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type InitiativePartnerProduct = Tables<'initiative_partner_products'> & {
  product?: Tables<'products'>;
};

export type InitiativePartner = Tables<'initiative_partners'> & {
  partner?: Tables<'partners'>;
  initiative_partner_products?: InitiativePartnerProduct[];
  partner_features?: Tables<'partner_features'>[];
};
export type InitiativePartnerInsert = TablesInsert<'initiative_partners'>;
export type InitiativePartnerUpdate = TablesUpdate<'initiative_partners'>;

export const useInitiativePartners = (initiativeId: string) => {
  return useQuery({
    queryKey: ['initiative-partners', initiativeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiative_partners')
        .select(`
          *,
          partner:partners (*),
          initiative_partner_products (
            *,
            product:products (*)
          ),
          partner_features (*)
        `)
        .eq('initiative_id', initiativeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InitiativePartner[];
    },
    enabled: !!initiativeId,
  });
};

export const useInitiativePartner = (id: string) => {
  return useQuery({
    queryKey: ['initiative-partner', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiative_partners')
        .select(`
          *,
          partner:partners (*),
          initiative_partner_products (
            *,
            product:products (*)
          ),
          partner_features (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as InitiativePartner;
    },
    enabled: !!id,
  });
};

export const useCreateInitiativePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InitiativePartnerInsert) => {
      const { data: result, error } = await supabase
        .from('initiative_partners')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['initiative-partners', variables.initiative_id] });
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
    },
  });
};

export const useUpdateInitiativePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: InitiativePartnerUpdate & { id: string }) => {
      const { data: result, error } = await supabase
        .from('initiative_partners')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['initiative-partners', data.initiative_id] });
      queryClient.invalidateQueries({ queryKey: ['initiative-partner', data.id] });
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
    },
  });
};

export const useDeleteInitiativePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, initiativeId }: { id: string; initiativeId: string }) => {
      const { error } = await supabase
        .from('initiative_partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { initiativeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['initiative-partners', data.initiativeId] });
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
    },
  });
};
