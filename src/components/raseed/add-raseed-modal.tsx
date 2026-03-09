'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from '@/components/ui/toast';

export function AddRaseedModal({
  open,
  onClose,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/raseed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create log');
      return data;
    },
    onSuccess: () => {
      onCreated();
      onClose();
      setName('');
      setDescription('');
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to create log', 'error');
    }
  });

  const form = (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (create.isPending) return;
        create.mutate();
      }}
    >
      <div>
        <label className="mb-1 block text-[11.5px] font-semibold text-ink-3 uppercase tracking-[0.06em]">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Goa Trip"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-semibold text-ink-3 uppercase tracking-[0.06em]">
          Description (optional)
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional note"
        />
      </div>
      <Button type="submit" className="w-full" isLoading={create.isPending} loadingLabel="Creating...">
        Create Log
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title="New Log">
        {form}
      </BottomSheet>
    );
  }

  return (
    <Modal open={open} onOpenChange={(v) => { if (!v) onClose(); }} title="New Log">
      {form}
    </Modal>
  );
}
