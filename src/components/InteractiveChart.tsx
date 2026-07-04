'use client';

import React, { useState } from 'react';
import styles from './InteractiveChart.module.css';

interface DataPoint {
  label: string;
  value: number;
  deals: number;
}

const data: DataPoint[] = [
  { label: 'Jan', value: 180000, deals: 3 },
  { label: 'Feb', value: 240000, deals: 5 },
  { label: 'Mar', value: 310000, deals: 6 },
  { label: 'Apr', value: 290000, deals: 4 },
  { label: 'May', value: 480000, deals: 8 },
  { label: 'Jun', value: 650000, deals: 11 },
];

export default function InteractiveChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const width = 600;
  const height = 240;
  const padding = 40;

  // Max value for scaling
  const maxValue = 800000;

  // Coordinate calculations
  const getX = (index: number) => {
    return padding + (index * (width - padding * 2)) / (data.length - 1);
  };

  const getY = (value: number) => {
    return height - padding - (value * (height - padding * 2)) / maxValue;
  };

  // Build the path d string
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }));
  
  // Build cubic bezier curved line
  let linePath = '';
  let areaPath = '';
  
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    
    // Close the area path to the bottom
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative', flex: 1 }}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Revenue Performance</h3>
          <p className={styles.subtitle}>Closed-won revenue growth over time</p>
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'var(--grad-primary)' }} />
            <span>Target Achieved</span>
          </div>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (height - padding * 2);
            const val = maxValue * (1 - ratio);
            return (
              <g key={i}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  className={styles.gridLine} 
                />
                <text 
                  x={padding - 10} 
                  y={y + 4} 
                  className={styles.yLabel}
                >
                  {val >= 1000 ? `$${val / 1000}k` : val}
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="url(#lineGradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round"
          />

          {/* Hover guidelines */}
          {hoveredIndex !== null && (
            <line
              x1={points[hoveredIndex].x}
              y1={padding}
              x2={points[hoveredIndex].x}
              y2={height - padding}
              className={styles.guideLine}
            />
          )}

          {/* Dots */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? 7 : 5}
                className={`${styles.dot} ${hoveredIndex === i ? styles.activeDot : ''}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="15"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}

          {/* X Axis Labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 12}
              className={styles.xLabel}
            >
              {d.label}
            </text>
          ))}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div 
            className={styles.tooltip}
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 35}%`,
            }}
          >
            <div className={styles.tooltipTitle}>{data[hoveredIndex].label} 2026</div>
            <div className={styles.tooltipVal}>
              ${data[hoveredIndex].value.toLocaleString()}
            </div>
            <div className={styles.tooltipSub}>
              {data[hoveredIndex].deals} Deals Closed
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
