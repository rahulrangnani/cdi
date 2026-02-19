import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApiDocument {
  id: string;
  initiative_partner_id: string;
  title: string;
  file_path: string;
  file_name: string;
  created_at: string;
  updated_at: string;
}

export const useApiDocuments = (initiativePartnerId?: string) => {
  return useQuery({
    queryKey: ['api_documents', initiativePartnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_documents')
        .select('*')
        .eq('initiative_partner_id', initiativePartnerId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ApiDocument[];
    },
    enabled: !!initiativePartnerId,
  });
};

export const useCreateApiDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doc: Omit<ApiDocument, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('api_documents').insert(doc).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api_documents', data.initiative_partner_id] });
    },
  });
};

export const useDeleteApiDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, filePath, initiativePartnerId }: { id: string; filePath: string; initiativePartnerId: string }) => {
      // Delete from storage
      await supabase.storage.from('api-documents').remove([filePath]);
      // Delete from DB
      const { error } = await supabase.from('api_documents').delete().eq('id', id);
      if (error) throw error;
      return initiativePartnerId;
    },
    onSuccess: (initiativePartnerId) => {
      queryClient.invalidateQueries({ queryKey: ['api_documents', initiativePartnerId] });
    },
  });
};

export const getSignedApiDocUrl = async (filePath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('api-documents')
    .createSignedUrl(filePath, 3600);
  if (error) return null;
  return data.signedUrl;
};
