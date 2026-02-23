'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PeopleManager } from '@/components/settings/people-manager';
import { Button } from '@/components/ui/button';
import { PageCrumbHeader } from '@/components/layout/page-crumb-header';

export default function SettingsPeoplePage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <PageCrumbHeader
        title="People"
        parentLabel="Settings"
        parentHref="/settings"
        crumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'People' }
        ]}
        rightSlot={
          <Button className="hidden md:inline-flex" onClick={() => setShowCreate(true)}>
            Add Person
          </Button>
        }
      />
      <PeopleManager createOpen={showCreate} onCreateOpenChange={setShowCreate} />

      <div className="fixed inset-x-4 bottom-24 z-30 md:hidden">
        <Button className="h-12 w-full" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Person
        </Button>
      </div>
    </div>
  );
}
