import type { ModerationStatus } from '@/types/types';
import { Badge, BadgeCheck, BadgeInfo, BadgeX, type Icon } from 'lucide-svelte';
import type { ComponentType } from 'svelte';

export const typeMap: Record<ModerationStatus, { label: string; icon: ComponentType<Icon> }> = {
    pending: {
        label: 'Pendente',
        icon: Badge,
    },
    approved: {
        label: 'Aprovado',
        icon: BadgeCheck,
    },
    changes_requested: {
        label: 'Alterações Solicitadas',
        icon: BadgeInfo,
    },
    rejected: {
        label: 'Rejeitado',
        icon: BadgeX,
    },
};
