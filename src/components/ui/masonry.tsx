import React, { useEffect, useState, useRef } from 'react';

interface MasonryLayoutProps {
  children: React.ReactNode[];
  columnCount?: number;
  gap?: number;
}

const MasonryLayout: React.FC<MasonryLayoutProps> = ({
  children,
  columnCount = 3,
  gap = 16
}) => {
  const [columns, setColumns] = useState<React.ReactNode[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const distributeItems = () => {
      if (!children || children.length === 0) {
        setColumns([]);
        return;
      }

      const newColumns: React.ReactNode[][] = Array.from({ length: columnCount }, () => []);
      const columnHeights = new Array(columnCount).fill(0);

      children.forEach((child, index) => {
        // Find the shortest column
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

        // Add item to shortest column
        newColumns[shortestColumnIndex].push(
          <div key={index} style={{ marginBottom: `${gap}px` }}>
            {child}
          </div>
        );

        // Estimate height increase (this is approximate)
        // In a real implementation, you might want to measure actual rendered heights
        columnHeights[shortestColumnIndex] += 200; // Approximate card height
      });

      setColumns(newColumns);
    };

    distributeItems();
  }, [children, columnCount, gap]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center"
      style={{ gap: `${gap}px` }}
    >
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex flex-col"
          style={{ width: `calc(${100 / columnCount}% - ${gap * (columnCount - 1) / columnCount}px)` }}
        >
          {column}
        </div>
      ))}
    </div>
  );
};

export default MasonryLayout;