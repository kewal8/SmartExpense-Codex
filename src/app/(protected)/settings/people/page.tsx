'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { PeopleManager } from '@/components/settings/people-manager';
import { Button } from '@/components/ui/button';

export default function SettingsPeoplePage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ChevronLeft className="h-4 w-4" /> Settings
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">People</h1>
        <Button className="hidden md:inline-flex" onClick={() => setShowCreate(true)}>
          Add Person
        </Button>
      </div>
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
