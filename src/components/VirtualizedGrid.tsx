


// /**
//  * VirtualizedGrid — Container-Based Virtualization (REFACTORED)
//  *
//  * ✅ ARCHITECTURE CHANGE: Now uses useVirtualizer with a dedicated scroll container
//  * instead of useWindowVirtualizer which relied on window scroll.
//  *
//  * Benefits:
//  * - Items render at correct position regardless of page layout
//  * - No dependency on header height, filters, or page structure
//  * - Fully isolated scrolling - only grid scrolls, not entire page
//  * - Fixes bottom-rendering and positioning issues
//  * - Works seamlessly on mobile and desktop
//  *
//  * Key Feature: Each VirtualizedGrid has its own scroll container
//  * Virtualization is completely isolated within the component.
//  */

// import React, { useRef, useCallback, useMemo } from "react";
// import { useVirtualizer } from "@tanstack/react-virtual";

// interface VirtualizedGridProps<T> {
//   items: T[];
//   renderItem: (item: T, index: number) => React.ReactNode;
//   columns?: number;
//   estimateSize?: number;
//   overscan?: number;
//   className?: string;
//   /** 
//    * Optional: Height of the scroll container
//    * Defaults to: 100% (fills parent container)
//    * Can be overridden for fixed-height containers (e.g., "calc(100vh - 400px)")
//    */
//   containerHeight?: string;
// }

// export function VirtualizedGrid<T>({
//   items,
//   renderItem,
//   columns = 3,
//   estimateSize = 420,
//   overscan = 4,
//   className = "",
//   containerHeight = "100%",
// }: VirtualizedGridProps<T>) {
//   // ✅ FIX 1: PREVENT EARLY INITIALIZATION
//   // Do not render VirtualizedGrid when items are empty
//   if (!items.length) {
//     return null;
//   }

//   // ✅ TWO-REF ARCHITECTURE FOR CONTAINER-BASED VIRTUALIZATION
//   // scrollContainerRef: The actual DOM element that scrolls (with overflow-y: auto)
//   // virtualContainerRef: The inner container that gets its height from virtualizer
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const virtualContainerRef = useRef<HTMLDivElement>(null);

//   // FIX 2: Use columns prop directly (single source of truth)
//   // Parent is responsible for calculating responsive columns
//   const effectiveColumns = columns;

//   // ✅ FIX 3: FORCE VIRTUALIZER COUNT SYNC
//   // Ensure count always reflects latest data
//   // Add safe fallback and log for debugging
//   const rowCount = Math.ceil((items.length || 0) / effectiveColumns);

//   // ✅ FIX 4: FORCE VIRTUALIZER RESET ON BOTH COLUMNS AND DATA CHANGES
//   // Use key based on BOTH columns and items.length to ensure virtualizer reinitializes
//   // when either layout or data changes
//   const virtualizerKey = `grid-${effectiveColumns}-${items.length}`;

//   // 🎯 MAIN CHANGE: Use useVirtualizer with getScrollElement instead of useWindowVirtualizer
//   // This ensures all virtualization happens within the scroll container
//   // NOT dependent on window scroll position
//   const rowVirtualizer = useVirtualizer({
//     count: rowCount,
//     // ✅ CRITICAL: Point virtualizer to our scroll container, not window
//     getScrollElement: () => scrollContainerRef.current,
//     estimateSize: () => estimateSize,
//     overscan,
//     // NO more scrollMargin - not needed for container-based virtualization
//   });

//   // ✅ FIX 6: DEBUG RENDERING STATE
//   // Log key state variables to diagnose rendering
//   const virtualRows = rowVirtualizer.getVirtualItems();

//   if (typeof window !== 'undefined' && (window as any).__GRID_DEBUG__) {
//     console.log(`[VirtualizedGrid] Render state (Container-based):`, {
//       virtualizerKey,
//       itemsCount: items.length,
//       effectiveColumns,
//       rowCount,
//       virtualRowsCount: virtualRows.length,
//       totalSize: rowVirtualizer.getTotalSize(),
//       scrollElement: scrollContainerRef.current ? "✓ Attached" : "✗ Not attached",
//       scrollTop: scrollContainerRef.current?.scrollTop,
//       containerHeight,
//     });
//   }

//   // ✅ FIX 7: ENSURE STABLE CONTAINER HEIGHT
//   // getTotalSize() must return valid height (> 0)
//   // If 0 → virtualization is broken
//   const totalHeight = rowVirtualizer.getTotalSize();
//   if (totalHeight === 0 && rowCount > 0) {
//     console.warn(
//       `[VirtualizedGrid] ERROR: totalHeight is 0 but rowCount=${rowCount}. Virtualizer may be broken.`
//     );
//   }

//   return (
//     <div key={virtualizerKey}>
//       {/* 
//         ✅ SCROLL CONTAINER: This div handles all scrolling
//         - Has fixed height
//         - Has overflow-y: auto for internal scrolling
//         - Virtualizer attaches to this ref
//         - Page DOES NOT scroll when user scrolls grid
//       */}
//       <div
//         ref={scrollContainerRef}
//         className={`w-full relative  ${className}`}
//         style={{
//           height: containerHeight,
//           // ✅ LAYOUT REFACTOR: Ensure full width expansion */
//           /* Smooth scrolling performance optimization */
//           willChange: "scroll-position",
//         }}
//       >
//         {/* 
//           ✅ VIRTUAL CONTAINER: Inner spacer that virtualizer measures
//           - Height matches total content height
//           - Contains all virtual rows
//           - Rows positioned absolutely within this container
//         */}
//         <div
//           ref={virtualContainerRef}
//           style={{
//             height: totalHeight || rowCount * estimateSize,
//             position: "relative",
//             width: "100%",
//           }}
//         >
//           {/* ✅ FIX 9: ENSURE VIRTUALROWS RENDERING */}
//           {/* If virtualRows is empty but items exist, virtualizer initialization failed */}
//           {virtualRows.length === 0 && items.length > 0 && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 pointerEvents: "none",
//               }}
//             >
//               <div
//                 className="text-xs text-slate-500 dark:text-slate-400 p-4 opacity-50"
//                 style={{ whiteSpace: "nowrap" }}
//               >
//                 ⚠️ Virtualizer initializing... (vRows: {virtualRows.length}, items:{" "}
//                 {items.length})
//               </div>
//             </div>
//           )}

//           {/* ✅ RENDER VIRTUAL ROWS */}
//           {/* Each row is positioned absolutely within the virtual container */}
//           {virtualRows.map((virtualRow) => {
//             const startIndex = virtualRow.index * effectiveColumns;

//             return (
//               <div
//                 key={virtualRow.key}
//                 data-index={virtualRow.index}
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   width: "100%",
//                   // ✅ FIX 10: CORRECT POSITIONING WITHIN CONTAINER
//                   // virtualRow.start is the offset within the scroll container
//                   // This works because virtualizer knows about the container ref
//                   transform: `translateY(${virtualRow.start}px)`,
//                 }}
//               >
//                 <div
//                   className="grid gap-6 pb-6 w-full"
//                   style={{
//                     gridTemplateColumns: `repeat(${effectiveColumns}, minmax(0, 1fr))`,
//                   }}
//                 >
//                   {Array.from({ length: effectiveColumns }).map((_, i) => {
//                     const item = items[startIndex + i];
//                     if (!item) return <div key={`ph-${startIndex + i}`} aria-hidden />;
//                     return (
//                       <div key={startIndex + i}>
//                         {renderItem(item, startIndex + i)}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default VirtualizedGrid;



/**
 * VirtualizedGrid — Parent-Scroll-Based Virtualization (FIXED)
 *
 * ✅ FIX 1: DOUBLE SCROLLBAR ELIMINATED
 *    Removed the inner scroll container entirely.
 *    The grid no longer creates its own <div overflow-y:auto>.
 *    Accepts a `scrollContainerRef` from the parent — the PARENT
 *    div is the single scroll owner.
 *
 * ✅ FIX 2: CARD OVERLAP ELIMINATED
 *    measureElement ref is passed to each virtual row so the
 *    virtualizer measures actual rendered heights rather than
 *    relying on a static estimateSize guess. This keeps
 *    translateY values accurate even when cards vary in height.
 *
 * ──────────────────────────────────────────────────────────────
 * HOW TO USE IN RoomsListing.tsx
 * ──────────────────────────────────────────────────────────────
 *
 *   // 1. Add ref to the scrollable wrapper div
 *   const gridScrollRef = useRef<HTMLDivElement>(null);
 *
 *   // 2. Attach ref to the overflow-y-auto div (already exists)
 *   <div ref={gridScrollRef} className="h-full overflow-y-auto">
 *     ...
 *     <VirtualizedGrid
 *       scrollContainerRef={gridScrollRef}   // <-- pass it here
 *       items={allRooms}
 *       renderItem={(room) => <RoomCard room={room} />}
 *       columns={columns}
 *       estimateSize={estimateSize}
 *       overscan={4}
 *     />
 *     ...
 *   </div>
 *
 *   // 3. Remove containerHeight prop — it no longer exists
 */

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
    // ✅ CRITICAL: point to the PARENT scroll container, not an inner div.
    // This is what eliminates the double scrollbar.
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

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
            ref={rowVirtualizer.measureElement}
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
                if (!item) return <div key={`ph-${startIndex + i}`} aria-hidden />;
                return (
                  <div key={startIndex + i}>
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