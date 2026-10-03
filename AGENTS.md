# Architecture Rules

- Store each escalation level as a JSON contact object with separate `name`, `email`, and `mobile` properties; read legacy string values as names. Why: structured contacts remain searchable and backward compatible.
- Partner-level `partners.escalation_matrix` is the default; initiative-partner `support_details.escalation_matrix` overrides individual contact properties. Why: enter contacts once while allowing per-initiative exceptions.
