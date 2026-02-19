import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Initiative = Tables<'initiatives'> & { parent_id?: string | null };
export type InitiativeInsert = TablesInsert<'initiatives'>;
export type InitiativeUpdate = TablesUpdate<'initiatives'>;

export const useInitiatives = (filters?: { status?: string; search?: string; parentId?: string | null }) => {
  return useQuery({
    queryKey: ['initiatives', filters],
    queryFn: async () => {
      let query = supabase
        .from('initiatives')
        .select(`
          *,
          initiative_partners (
            id,
            partner:partners (
              id,
              name,
              logo_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.parentId !== undefined) {
        if (filters.parentId === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', filters.parentId);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

// Fetch only top-level (parent) initiatives
export const useParentInitiatives = () => {
  return useQuery({
    queryKey: ['initiatives', 'parents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiatives')
        .select('id, name')
        .is('parent_id', null)
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useInitiative = (id: string) => {
  return useQuery({
    queryKey: ['initiative', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiatives')
        .select(`
          *,
          initiative_partners (
            *,
            partner:partners (*),
            api_specifications (*),
            support_details (*),
            initiative_partner_products (
              *,
              product:products (*)
            ),
            partner_features (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useSubInitiatives = (parentId: string) => {
  return useQuery({
    queryKey: ['initiatives', 'sub', parentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiatives')
        .select(`
          *,
          initiative_partners (
            id,
            partner:partners (id, name, logo_url)
          )
        `)
        .eq('parent_id', parentId)
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!parentId,
  });
};

export const useCreateInitiative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (initiative: InitiativeInsert) => {
      const { data, error } = await supabase
        .from('initiatives')
        .insert(initiative)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
    },
  });
};

export const useUpdateInitiative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...initiative }: InitiativeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('initiatives')
        .update(initiative)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
      queryClient.invalidateQueries({ queryKey: ['initiative', variables.id] });
    },
  });
};

export const useDeleteInitiative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('initiatives')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
    },
  });
};
