# Architecture Rules

- Store partner support escalation contacts as JSON on the existing one-to-one support record, keeping support data initiative-partner scoped and extensible.- Partner-level escalation matrix (partners.escalation_matrix) is the default; initiative-partner support_details.escalation_matrix overrides per level. Why: enter contacts once, allow per-initiative exceptions.
