import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn exists

interface CardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  className?: string; // Add className prop for flexibility
}

export function Card({ title, value, icon: Icon, trend = 'neutral', subtitle, className }: CardProps) {
  const trendColors = {
    positive: 'text-emerald-600 bg-emerald-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-blue-600 bg-blue-100',
  };

  return (
    <div className={cn("bg-white rounded-md shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all hover:scale-[1.02]", className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
        <div className={cn("p-2.5 rounded-md shadow-sm", trendColors[trend])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
