# Partner Support Escalation Matrix

## What will change
- Add an optional escalation matrix to each initiative-specific partner Support section.
- Include seven fixed levels: Escalation 1, Escalation 2, Escalation 3, Critical Escalation, CBO, CTO, and CEO.
- Let admins enter or update a contact/detail value for each level while editing a partner.
- Show only populated escalation levels to users in the partner Support tab.

## Data and compatibility
- Extend the existing partner support record with an `escalation_matrix` JSON field, defaulting to an empty object.
- Keep all existing support records and partner IDs unchanged.
- Existing partners continue working without an escalation matrix.

## Technical details
- Add a small support-details save hook that upserts by initiative-partner ID.
- Add the seven optional fields to the current partner admin form and save them after the partner record exists.
- Render a compact, responsive escalation table in the existing Support tab.
- Refresh the partner/initiative data after saving so changes appear immediately.

## Verification
- Confirm an admin can save all seven escalation levels and later edit them.
- Confirm only filled levels appear in the user-facing Support tab.
- Confirm partners without escalation details retain the current Support display unchanged.
