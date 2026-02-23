'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ExpenseTypeManager } from '@/components/settings/expense-type-manager';
import { Button } from '@/components/ui/button';
import { PageCrumbHeader } from '@/components/layout/page-crumb-header';

export default function SettingsExpenseTypesPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <PageCrumbHeader
        title="Expense Types"
        parentLabel="Settings"
        parentHref="/settings"
        crumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Expense Types' }
        ]}
        rightSlot={
          <Button className="hidden md:inline-flex" onClick={() => setShowCreate(true)}>
            Add Type
          </Button>
        }
      />
      <ExpenseTypeManager createOpen={showCreate} onCreateOpenChange={setShowCreate} />

      <div className="fixed inset-x-4 bottom-24 z-30 md:hidden">
        <Button className="h-12 w-full" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Type
        </Button>
      </div>
    </div>
  );
}
