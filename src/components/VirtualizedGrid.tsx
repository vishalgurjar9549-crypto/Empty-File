import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns?: number;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  /**
   * Ref to the scrollable parent container.
   * That div must have:  overflow-y: auto/scroll  +  a concrete height.
   * Passing this ref means the virtualizer attaches to ONE scroll owner,
   * eliminating the double-scrollbar entirely.
   */
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  columns = 3,
  estimateSize = 420,
  overscan = 4,
  className = "",
  scrollContainerRef,
}: VirtualizedGridProps<T>) {
  // Don't render until we have items
  if (!items.length) return null;

  const rowCount = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });
  React.useEffect(() => {
    rowVirtualizer.measure();
  }, [items.length]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  return (
    /**
     * ✅ This wrapper is a SPACER only — no overflow, no fixed height set by us.
     * Its height equals the virtualizer's total computed height so the parent
     * scrollbar has the correct range.  The parent div scrolls; this div does not.
     */
    <div
      className={`relative w-full ${className}`}
      style={{ height: totalHeight }}
    >
      {virtualRows.map((virtualRow) => {
        const startIndex = virtualRow.index * columns;

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            // ✅ measureElement lets the virtualizer measure the REAL rendered
            // height of each row after mount, fixing overlap caused by wrong estimates.
            ref={(el) => {
              if (el) rowVirtualizer.measureElement(el);
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div
              className="grid gap-6 pb-6 w-full"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: columns }).map((_, i) => {
                const item = items[startIndex + i];
                if (!item)
                  return <div key={`ph-${startIndex + i}`} aria-hidden />;
                return (
                  <div
                    key={(items[startIndex + i] as any)?.id || startIndex + i}
                  >
                    {" "}
                    {renderItem(item, startIndex + i)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VirtualizedGrid;
