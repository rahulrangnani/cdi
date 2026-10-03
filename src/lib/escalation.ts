export const ESCALATION_LEVELS = [
  ['escalation_1', 'Escalation 1'],
  ['escalation_2', 'Escalation 2'],
  ['escalation_3', 'Escalation 3'],
  ['critical_escalation', 'Critical Escalation'],
  ['cbo', 'CBO'],
  ['cto', 'CTO'],
  ['ceo', 'CEO'],
] as const;

export type EscalationLevelKey = (typeof ESCALATION_LEVELS)[number][0];

export type EscalationContact = {
  name?: string;
  email?: string;
  mobile?: string;
};

export type EscalationMatrix = Partial<Record<EscalationLevelKey, EscalationContact | string>>;

export const normalizeEscalationContact = (value: unknown): EscalationContact => {
  if (typeof value === 'string') return value.trim() ? { name: value.trim() } : {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const contact = value as Record<string, unknown>;
  return {
    name: typeof contact.name === 'string' ? contact.name.trim() : undefined,
    email: typeof contact.email === 'string' ? contact.email.trim() : undefined,
    mobile: typeof contact.mobile === 'string' ? contact.mobile.trim() : undefined,
  };
};

export const hasEscalationContact = (contact: EscalationContact) =>
  Boolean(contact.name || contact.email || contact.mobile);