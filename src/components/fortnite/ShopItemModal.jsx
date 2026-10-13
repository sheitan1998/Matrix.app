import React from 'react';
import FortniteItemDialog from '@/components/fortnite/FortniteItemDialog';

export default function ShopItemModal({ item, onClose, user }) {
  return <FortniteItemDialog item={item} onClose={onClose} user={user} />;
}