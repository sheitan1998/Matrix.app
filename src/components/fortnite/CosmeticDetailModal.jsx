import React from 'react';
import FortniteItemDialog from '@/components/fortnite/FortniteItemDialog';

export default function CosmeticDetailModal({ cosmetic, onClose, onSelect, user }) {
  return <FortniteItemDialog item={cosmetic} onClose={onClose} onSelect={onSelect} user={user} fullscreen />;
}