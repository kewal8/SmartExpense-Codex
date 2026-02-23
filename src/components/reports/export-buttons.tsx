import { Button } from '@/components/ui/button';

export function ExportButtons() {
  return (
    <div className="flex gap-2">
      <a href="/api/reports/export">
        <Button variant="secondary">Export CSV</Button>
      </a>
      <Button variant="secondary" disabled>
        PDF (next step)
      </Button>
    </div>
  );
}
