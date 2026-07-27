import { useRef, useState, type ReactNode } from "react";

interface TooltipWrapperProps {
  text: string;
  children: ReactNode;
}

export default function TooltipWrapper({
  text,
  children,
}: TooltipWrapperProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timer = useRef<number | null>(null);

  const startLongPress = () => {
    timer.current = window.setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const endLongPress = () => {
    if (timer.current) clearTimeout(timer.current);

    setTimeout(() => setShowTooltip(false), 150);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: "50%",
          transform: showTooltip
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(-5px)",
          background: "var(--card-bg)",
          color: "var(--text-main)",
          border: "1px solid var(--pill-text)",
          borderRadius: "8px",
          padding: "6px 10px",
          fontSize: "0.75rem",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: showTooltip ? 1 : 0,
          transition: "all .2s ease",
          backdropFilter: "blur(10px)",
          boxShadow: "0 5px 15px rgba(0,0,0,.2)"
        }}
      >
        {text}
      </div>

      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={startLongPress}
        onTouchEnd={endLongPress}
        onTouchCancel={endLongPress}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {children}
      </div>
    </div>
  );
}