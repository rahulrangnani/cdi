import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type EscalationMatrix = {
  escalation_1?: string;
  escalation_2?: string;
  escalation_3?: string;
  critical_escalation?: string;
  cbo?: string;
  cto?: string;
  ceo?: string;
};

export const useUpsertSupportEscalationMatrix = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ initiativePartnerId, initiativeId, escalationMatrix }: {
      initiativePartnerId: string;
      initiativeId: string;
      escalationMatrix: EscalationMatrix;
    }) => {
      const { data, error } = await supabase
        .from('support_details')
        .upsert(
          { initiative_partner_id: initiativePartnerId, escalation_matrix: escalationMatrix },
          { onConflict: 'initiative_partner_id' },
        )
        .select()
        .single();

      if (error) throw error;
      return { data, initiativeId };
    },
    onSuccess: ({ data, initiativeId }) => {
      queryClient.invalidateQueries({ queryKey: ['initiative', initiativeId] });
      queryClient.invalidateQueries({ queryKey: ['initiative-partners', initiativeId] });
      queryClient.invalidateQueries({ queryKey: ['initiative-partner', data.initiative_partner_id] });
    },
  });
};