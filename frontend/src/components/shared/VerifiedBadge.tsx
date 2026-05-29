import { CheckCircle } from 'lucide-react';

export default function VerifiedBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] bg-gray-900 text-white px-2 py-0.5 rounded-full font-medium ${className}`}>
      <CheckCircle className="w-3 h-3" />
      موثق
    </span>
  );
}
