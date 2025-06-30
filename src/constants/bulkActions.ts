// src/constants/bulkActions.ts
import { Trash2, Star, Ban, Shield, AlertTriangle } from 'lucide-react';

export const commonBulkActions = {
  delete: {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    color: 'bg-red-100 text-red-700 hover:bg-red-200',
    destructive: true,
    requiresConfirmation: true
  },
  feature: {
    id: 'feature',
    label: 'Feature',
    icon: Star,
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
  },
  ban: {
    id: 'ban',
    label: 'Ban',
    icon: Ban,
    color: 'bg-red-100 text-red-700 hover:bg-red-200',
    destructive: true,
    requiresConfirmation: true
  },
  makeAdmin: {
    id: 'make_admin',
    label: 'Make Admin',
    icon: Shield,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    requiresConfirmation: true
  },
  moderate: {
    id: 'moderate',
    label: 'Review',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
  }
};
