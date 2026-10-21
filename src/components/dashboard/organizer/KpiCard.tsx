import React from "react";
import { Calendar, Star, Heart, DollarCircle } from "iconsax-react";

import {StatMetric} from "@/types/organizer.type";

export default function KpiCard({ metric }: { metric: StatMetric }) {
  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case "Calendar": return <Calendar size={28} variant="Linear" color="#ffffff" />;
      case "Star": return <Star size={28} variant="Linear" color="#ffffff" />;
      case "Heart": return <Heart size={28} variant="Linear" color="#ffffff" />;
      case "Money": return <DollarCircle size={28} variant="Linear" color="#ffffff" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 card-shadow flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {(() => {
            const match = metric.dotColor.match(/#([0-9A-Fa-f]{6})/);
            const hex = match ? `#${match[1]}` : '#18abc6';
            return (
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: hexToRgba(hex, 0.12) }}>
                <span className="block rounded-full" style={{ width: 12, height: 12, backgroundColor: hex }} />
              </div>
            );
          })()}
          <p className="text-sm font-medium text-des">{metric.title}</p>
        </div>
        <h3 className="text-3xl font-extrabold secondary-color tracking-tight">{metric.value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${metric.iconBg}`}>
        {renderIcon(metric.iconName)}
      </div>
    </div>
  );
}