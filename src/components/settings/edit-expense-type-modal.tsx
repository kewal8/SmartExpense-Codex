'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type EditExpenseTypeModalProps = {
  open: boolean;
  currentName: string;
  isLoading: boolean;
  title?: string;
  label?: string;
  onClose: () => void;
  onSave: (name: string) => void;
};

export function EditExpenseTypeModal({
  open,
  currentName,
  isLoading,
  title = 'Edit Expense Type',
  label = 'Type Name',
  onClose,
  onSave
}: EditExpenseTypeModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  return (
    <Modal
      open={open}
      onOpenChange={(value) => {
        if (!value && !isLoading) onClose();
      }}
      title={title}
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (isLoading) return;
          onSave(name);
        }}
      >
        <div>
          <label htmlFor="expense-type-name" className="mb-1 block text-sm text-[var(--text-secondary)]">
            {label}
          </label>
          <Input
            id="expense-type-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter type name"
            required
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} loadingLabel="Saving...">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
