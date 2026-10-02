# Partner escalation contacts and bulk Excel upload

## 1. Escalation contacts on the Add/Edit Partner page
- Add a new "Escalation Matrix" block to the Support Contact section of the partner form, with seven optional fields: Escalation 1, Escalation 2, Escalation 3, Critical Escalation, CBO, CTO and CEO.
- These contacts belong to the partner itself, so you only enter them once.
- On the initiative page's Support tab, the escalation matrix uses the partner's own contacts by default. If you set initiative-specific contacts in an initiative's partner dialog, those replace the defaults one level at a time. The tab only shows levels that have a contact filled in.

## 2. Bulk partner upload from Excel
- Add a "Bulk Upload" button to the Partners page that opens a dialog with:
  - **Download Template**: an Excel file with a header row, one example row and an Instructions sheet.
  - **Upload file**: pick a .xlsx file. The dialog shows a preview table with row-by-row checks (name required, valid emails, valid website, status must be one of the allowed values). Rows with errors are highlighted.
  - **Import**: adds every valid row as a new partner and then shows how many were added, skipped or failed.
- Rows whose partner name already exists are skipped, so nothing gets duplicated.
- The imported partners are not attached to any bucket or initiative. You can link them later from the initiative's partner section, the same way you do today.

### Template columns (sheet "Partners")
Partner Name*, Website, Partner Type, Status (active/inactive), Contact Name, Contact Email, Contact Phone, Support Email, Support Phone, Support Hours, Escalation 1, Escalation 2, Escalation 3, Critical Escalation, CBO, CTO, CEO

Only the column marked * is required. Each escalation cell holds free text, for example "Name - email - phone".

## Technical details
- Migration: `ALTER TABLE public.partners ADD COLUMN escalation_matrix jsonb NOT NULL DEFAULT '{}'`. Existing admin RLS policies cover it.
- `PartnerForm.tsx`: add the seven fields to the schema, defaults, reset and payload, and trim empty values.
- `InitiativeDetail.tsx`: merge per level, initiative-partner `support_details.escalation_matrix` over `partners.escalation_matrix`.
- Add the `xlsx` (SheetJS) package. Generate the template on the client. The new `BulkPartnerUpload.tsx` dialog parses and validates the file, deduplicates against existing names (case-insensitive), and does a batch insert into `partners` (admin RLS).
- Record a rule in AGENTS.md: partner-level escalation acts as the default, with initiative-partner overrides.
