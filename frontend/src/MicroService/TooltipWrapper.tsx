import React, { useRef, useState, useEffect, cloneElement, isValidElement, type ReactNode, type ReactElement } from "react";
import { createPortal } from "react-dom";

interface TooltipWrapperProps {
  text: string;
  children: ReactNode;
}

export default function TooltipWrapper({ text, children }: TooltipWrapperProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  // THE FIX: Changed default placement state to 'top'
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [shiftX, setShiftX] = useState(0);

  const timer = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Hide tooltip automatically if the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (showTooltip) setShowTooltip(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showTooltip]);

  // Precision pass once the tooltip mounts to get exact pixel width
  useEffect(() => {
    if (showTooltip && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const safePadding = 12;
      const tooltipHalfWidth = tooltipRect.width / 2;
      
      let newShiftX = 0;
      if (coords.x - tooltipHalfWidth < safePadding) {
        newShiftX = safePadding - (coords.x - tooltipHalfWidth);
      } else if (coords.x + tooltipHalfWidth > window.innerWidth - safePadding) {
        newShiftX = (window.innerWidth - safePadding) - (coords.x + tooltipHalfWidth);
      }
      
      setShiftX(newShiftX);
    }
  }, [showTooltip, coords.x]);

  // Calculate position directly from the event target (Zero React Refs required)
  const handlePositioning = (target: HTMLElement) => {
    if (typeof window === 'undefined') return;

    const childRect = target.getBoundingClientRect();
    const center = childRect.left + (childRect.width / 2);

    // --- Y-Axis Flip Calculation (Inverted for Top-Default) ---
    const spaceAbove = childRect.top;
    const spaceBelow = window.innerHeight - childRect.bottom;
    const spaceNeeded = 45; // Estimated height + gap

    // THE FIX: Default to 'top'. Only flip to 'bottom' if there's no room above AND there is room below.
    const newPlacement = spaceAbove < spaceNeeded && spaceBelow > spaceNeeded ? 'bottom' : 'top';
    const y = newPlacement === 'top' ? childRect.top - 8 : childRect.bottom + 8;

    setCoords({ x: center, y });
    setPlacement(newPlacement);
  };

  const show = (target: HTMLElement) => {
    handlePositioning(target);
    setShowTooltip(true);
  };

  const hide = () => setShowTooltip(false);

  const startLongPress = (target: HTMLElement) => {
    handlePositioning(target);
    timer.current = window.setTimeout(() => setShowTooltip(true), 500);
  };

  const endLongPress = () => {
    if (timer.current) clearTimeout(timer.current);
    setTimeout(hide, 150);
  };

  // If the child is not a valid React element, just return it untouched
  if (!isValidElement(children)) {
    return <>{children}</>;
  }

  // Typecast to ReactElement so TypeScript knows we can access its props safely
  const child = children as ReactElement;

  // 1. Grab the props once and lock in the strict TypeScript definition
  const originalProps = child.props as React.HTMLAttributes<HTMLElement>;

  // 2. Secretly inject tracking events
  const childProps = {
    ...originalProps, 

    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      show(e.currentTarget);
      if (originalProps.onMouseEnter) originalProps.onMouseEnter(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hide();
      if (originalProps.onMouseLeave) originalProps.onMouseLeave(e);
    },
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
      startLongPress(e.currentTarget);
      if (originalProps.onTouchStart) originalProps.onTouchStart(e);
    },
    onTouchEnd: (e: React.TouchEvent<HTMLElement>) => {
      endLongPress();
      if (originalProps.onTouchEnd) originalProps.onTouchEnd(e);
    },
    onTouchCancel: (e: React.TouchEvent<HTMLElement>) => {
      endLongPress();
      if (originalProps.onTouchCancel) originalProps.onTouchCancel(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      show(e.currentTarget);
      if (originalProps.onFocus) originalProps.onFocus(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hide();
      if (originalProps.onBlur) originalProps.onBlur(e);
    },
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      hide(); // Force hide tooltip instantly upon clicking
      if (originalProps.onClick) originalProps.onClick(e);
    }
  };

  // eslint-disable-next-line react-hooks/refs
  const clonedChild = cloneElement(child, childProps);

  const isTop = placement === 'top';
  // Slide animation perfectly maps to whether it sits above or below the element
  const transformY = showTooltip ? (isTop ? '-100%' : '0') : (isTop ? 'calc(-100% + 5px)' : '-5px');

  // Teleport the tooltip to the top level of the DOM natively
  const tooltipPortal = (typeof document !== 'undefined' && document.body) ? createPortal(
    <div
      ref={tooltipRef}
      style={{
        position: "fixed", // Locked to viewport
        top: `${coords.y}px`,
        left: `${coords.x}px`,
        transform: `translateX(calc(-50% + ${shiftX}px)) translateY(${transformY})`,
        
        background: "color-mix(in srgb, var(--tooltip-bg) 45%, transparent)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        
        color: "var(--text-main)",
        border: "1px solid var(--pill-border)",
        borderRadius: "6px",
        padding: "8px 12px",
        fontSize: "0.75rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        opacity: showTooltip ? 1 : 0,
        visibility: showTooltip ? "visible" : "hidden",
        transition: "all .2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        zIndex: 99999, // Immune to z-index wars
      }}
    >
      {text}

      {/* The Triangle Arrow */}
      <div
        style={{
          position: "absolute",
          left: `calc(50% - ${shiftX}px)`, // Keeps arrow anchored directly to the button
          transform: "translateX(-50%)",
          borderWidth: "6px",
          borderStyle: "solid",
          ...(isTop ? {
            top: "100%",
            borderColor: "var(--pill-border) transparent transparent transparent"
          } : {
            bottom: "100%",
            borderColor: "transparent transparent var(--pill-border) transparent"
          })
        }}
      />
    </div>,
    document.body
  ) : null;

  return (
    <>
      {clonedChild}
      {tooltipPortal}
    </>
  );
}