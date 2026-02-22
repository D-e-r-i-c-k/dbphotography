import React from 'react';

interface HorizontalMasonryProps<T> {
    items: T[];
    renderItem: (item: T, originalIndex: number) => React.ReactNode;
}

/**
 * Renders a CSS Masonry Grid that flows Horizontally (left-to-right) instead of Vertically.
 * Because native CSS columns sort vertically, this creates duplicate DOM nodes for responsive breakpoints
 * and filters the items into strict Flex columns visually representing left-to-right chronological order.
 */
export function HorizontalMasonry<T>({ items, renderItem }: HorizontalMasonryProps<T>) {
    return (
        <div className="w-full relative flex justify-center">
            {/* Mobile: 1 Column */}
            <div className="flex flex-col gap-2 sm:hidden w-fit items-center">
                {items.map((item, i) => (
                    <React.Fragment key={`mobile-${i}`}>{renderItem(item, i)}</React.Fragment>
                ))}
            </div>

            {/* Tablet: 2 Columns */}
            <div className="hidden sm:flex lg:hidden flex-row gap-2 justify-center items-start w-fit">
                <div className="flex flex-col gap-2 items-center">
                    {items.map((item, i) => (i % 2 === 0 ? <React.Fragment key={`tab-0-${i}`}>{renderItem(item, i)}</React.Fragment> : null))}
                </div>
                <div className="flex flex-col gap-2 items-center">
                    {items.map((item, i) => (i % 2 === 1 ? <React.Fragment key={`tab-1-${i}`}>{renderItem(item, i)}</React.Fragment> : null))}
                </div>
            </div>

            {/* Desktop: 3 Columns */}
            <div className="hidden lg:flex flex-row gap-2 justify-center items-start w-fit">
                <div className="flex flex-col gap-2 items-center">
                    {items.map((item, i) => (i % 3 === 0 ? <React.Fragment key={`desk-0-${i}`}>{renderItem(item, i)}</React.Fragment> : null))}
                </div>
                <div className="flex flex-col gap-2 items-center">
                    {items.map((item, i) => (i % 3 === 1 ? <React.Fragment key={`desk-1-${i}`}>{renderItem(item, i)}</React.Fragment> : null))}
                </div>
                <div className="flex flex-col gap-2 items-center">
                    {items.map((item, i) => (i % 3 === 2 ? <React.Fragment key={`desk-2-${i}`}>{renderItem(item, i)}</React.Fragment> : null))}
                </div>
            </div>
        </div>
    );
}
