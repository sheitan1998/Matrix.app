import React from 'react';
import FortniteItemDialog from '@/components/fortnite/FortniteItemDialog';

export default function CosmeticDetailModal({ cosmetic, onClose, user }) {
  return <FortniteItemDialog item={cosmetic} onClose={onClose} user={user} fullscreen />;
}