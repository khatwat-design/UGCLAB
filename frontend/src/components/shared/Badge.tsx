import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const labels: Record<string, string> = {
    active: 'نشط',
    open: 'مفتوح',
    draft: 'مسودة',
    pending: 'قيد الانتظار',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    held: 'معلق',
    released: 'تم الصرف',
    refunded: 'مسترجع',
    submitted: 'مقدم',
    in_review: 'قيد المراجعة',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusColor(status),
        className
      )}
    >
      {labels[status] || status}
    </span>
  );
}
