/**
 * VirtualizedGrid Component
 * 
 * Renders large lists efficiently using @tanstack/react-virtual
 * Only renders items that are visible in the viewport
 * Dramatically improves performance with 1000+ items
 * 
 * Usage:
 * <VirtualizedGrid
 *   items={rooms}
 *   renderItem={(room, index) => <RoomCard room={room} />}
 *   columns={3}
 * />
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns?: number;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  containerClassName?: string;
}

/**
 * Hook to determine window width (simpler than useWindowSize)
 */
function useWindowWidth(): number {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return width;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  columns = 3,
  estimateSize = 400,
  overscan = 10,
  className = '',
  containerClassName = '',
}: VirtualizedGridProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const width = useWindowWidth();

  // Determine responsive columns based on width
  const responsiveColumns = useMemo(() => {
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return columns;
  }, [width, columns]);

  // Calculate number of rows needed
  const rowCount = Math.ceil(items.length / responsiveColumns);

  // Virtualize rows instead of items (more efficient for grids)
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  // ✅ DEBUG: Log data before rendering
  if (process.env.NODE_ENV === 'development') {
    console.log('[VirtualizedGrid] Render state:', {
      itemsLength: items.length,
      rowCount,
      virtualRowsLength: virtualRows.length,
      responsiveColumns,
      paddingTop,
      paddingBottom,
    });
  }

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-auto ${className}`}
      style={{
        height: 'calc(100vh - 200px)',
      }}
    >
      <div
        className={`grid gap-6 ${containerClassName}`}
        style={{
          gridTemplateColumns: `repeat(${responsiveColumns}, minmax(0, 1fr))`,
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
        }}
      >
        {virtualRows.map((virtualRow) => {
          return (
            <React.Fragment key={`row-${virtualRow.index}`}>
              {Array.from({ length: responsiveColumns }).map((_, i) => {
                const itemIndex = virtualRow.index * responsiveColumns + i;
                const item = items[itemIndex];

                if (!item) {
                  return <div key={`placeholder-${itemIndex}`} />;
                }

                return (
                  <div key={itemIndex}>
                    {renderItem(item, itemIndex)}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualizedGrid;
