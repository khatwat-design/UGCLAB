import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
}

export default function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-1">
        <span className="stat-label">{title}</span>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <span className="stat-value">{value}</span>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
    </motion.div>
  );
}
