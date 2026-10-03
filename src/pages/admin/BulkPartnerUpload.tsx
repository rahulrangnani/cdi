import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ESCALATION_LEVELS } from '@/lib/escalation';

const COLUMNS: [string, string][] = [
  ['Partner Name*', 'name'], ['Website', 'website'], ['Partner Type', 'partner_type'],
  ['Status', 'status'], ['Contact Name', 'contact_name'], ['Contact Email', 'contact_email'],
  ['Contact Phone', 'contact_phone'], ['Support Email', 'support_email'],
  ['Support Phone', 'support_phone'], ['Support Hours', 'support_hours'],
  ...ESCALATION_LEVELS.flatMap(([key, label]) => [
    [`${label} Name`, `${key}_name`], [`${label} Email`, `${key}_email`], [`${label} Mobile Number`, `${key}_mobile`],
  ] as [string, string][]),
];
const ESC_KEYS = ESCALATION_LEVELS.map(([key]) => key);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Row { data: Record<string, string>; errors: string[]; duplicate?: boolean }

const downloadTemplate = () => {
  const example = ['Acme Verify', 'https://acme.com', 'Technology Provider', 'active', 'John Doe', 'john@acme.com',
    '+91 98765 43210', 'support@acme.com', '+91 1800 000 000', '9 AM - 6 PM IST',
    'Asha', 'asha@acme.com', '9876500001', 'Ravi', 'ravi@acme.com', '9876500002', ...Array(15).fill('')];
  const ws = XLSX.utils.aoa_to_sheet([COLUMNS.map((c) => c[0]), example]);
  ws['!cols'] = COLUMNS.map(() => ({ wch: 24 }));
  const info = XLSX.utils.aoa_to_sheet([
    ['Instructions'],
    ['1. Fill one partner per row in the "Partners" sheet. Delete the example row.'],
    ['2. Only "Partner Name*" is required. All other columns are optional.'],
    ['3. Status must be "active" or "inactive" (defaults to active).'],
    ['4. Website must start with http:// or https://. Emails must be valid.'],
    ['5. Enter escalation Name, Email, and Mobile Number in their separate columns.'],
    ['6. Partners whose name already exists are skipped.'],
    ['7. After upload, link partners to initiatives from the admin Initiatives section.'],
  ]);
  info['!cols'] = [{ wch: 90 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Partners');
  XLSX.utils.book_append_sheet(wb, info, 'Instructions');
  XLSX.writeFile(wb, 'partners-bulk-upload-template.xlsx');
};

const BulkPartnerUpload = () => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const onFile = async (file: File) => {
    const wb = XLSX.read(await file.arrayBuffer());
    const ws = wb.Sheets['Partners'] ?? wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
    const { data: existing } = await supabase.from('partners').select('name');
    const names = new Set((existing ?? []).map((p) => p.name.trim().toLowerCase()));
    const seen = new Set<string>();
    setRows(raw.map((r) => {
      const data: Record<string, string> = {};
      COLUMNS.forEach(([h, k]) => { data[k] = String(r[h] ?? r[h.replace('*', '')] ?? '').trim(); });
      const errors: string[] = [];
      if (!data.name) errors.push('Name required');
      if (data.website && !/^https?:\/\//i.test(data.website)) errors.push('Invalid website');
      const emailKeys = ['contact_email', 'support_email', ...ESC_KEYS.map((key) => `${key}_email`)];
      emailKeys.forEach((k) => { if (data[k] && !EMAIL.test(data[k])) errors.push(`Invalid ${k.replaceAll('_', ' ')}`); });
      data.status = (data.status || 'active').toLowerCase();
      if (!['active', 'inactive'].includes(data.status)) errors.push('Status must be active/inactive');
      const key = data.name.toLowerCase();
      const duplicate = !!key && (names.has(key) || seen.has(key));
      seen.add(key);
      return { data, errors, duplicate };
    }).filter((r) => Object.values(r.data).some((v) => v && v !== 'active')));
  };

  const valid = rows.filter((r) => !r.errors.length && !r.duplicate);

  const doImport = async () => {
    setBusy(true);
    const payload = valid.map(({ data }) => {
      const p: Record<string, unknown> = { escalation_matrix: {} };
      COLUMNS.forEach(([, k]) => {
        if (!ESC_KEYS.some((key) => k.startsWith(`${key}_`))) p[k] = data[k] || null;
      });
      ESC_KEYS.forEach((key) => {
        const contact = Object.fromEntries(['name', 'email', 'mobile'].map((detail) => [detail, data[`${key}_${detail}`]]).filter(([, value]) => value));
        if (Object.keys(contact).length) (p.escalation_matrix as Record<string, unknown>)[key] = contact;
      });
      return p;
    });
    const { error } = await supabase.from('partners').insert(payload as never);
    setBusy(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Import failed', description: error.message });
      return;
    }
    qc.invalidateQueries({ queryKey: ['partners'] });
    toast({
      title: `${valid.length} partners added`,
      description: `${rows.filter((r) => r.duplicate).length} skipped (duplicate), ${rows.filter((r) => r.errors.length).length} with errors`,
    });
    setRows([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setRows([]); }}>
      <DialogTrigger asChild>
        <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" />Bulk Upload</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bulk upload partners</DialogTitle>
          <DialogDescription>Download the template, fill it in, then upload it here.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />Download Template
          </Button>
          <Input type="file" accept=".xlsx,.xls" className="max-w-xs"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </div>
        {rows.length > 0 && (
          <>
            <div className="max-h-80 overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Check</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i} className={cn((r.errors.length || r.duplicate) && 'bg-destructive/5')}>
                      <TableCell>{i + 2}</TableCell>
                      <TableCell className="font-medium">{r.data.name || '—'}</TableCell>
                      <TableCell>{r.data.partner_type}</TableCell>
                      <TableCell>{r.data.status}</TableCell>
                      <TableCell className={cn('text-xs', r.errors.length || r.duplicate ? 'text-destructive' : 'text-primary')}>
                        {r.errors.length ? r.errors.join(', ') : r.duplicate ? 'Already exists – skipped' : 'Ready'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{valid.length} of {rows.length} rows ready to import</p>
              <Button onClick={doImport} disabled={!valid.length || busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Import {valid.length}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkPartnerUpload;
