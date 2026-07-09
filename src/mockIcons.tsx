import React from "react";

// A clean, lightweight mock icon component for the web preview
const MockIcon = ({ name, size = 16, color = "currentColor", style }: any) => {
  // Return a simple character or bullet that represents the icon on web
  let iconChar = "•";
  if (name === "lock" || name === "LockClosed" || name === "Lock") iconChar = "🔒";
  else if (name === "star") iconChar = "⭐";
  else if (name === "zap" || name === "Sparkles") iconChar = "⚡";
  else if (name === "award" || name === "Ribbon") iconChar = "🏆";
  else if (name === "book" || name === "Book" || name === "book-open") iconChar = "📖";
  else if (name === "list") iconChar = "📝";
  else if (name === "file-text") iconChar = "📄";
  else if (name === "layers") iconChar = "📚";
  else if (name === "chevron-down") iconChar = "▼";
  else if (name === "chevron-up") iconChar = "▲";
  else if (name === "chevron-left" || name === "ChevronLeft") iconChar = "◀";
  else if (name === "chevron-right" || name === "ChevronRight") iconChar = "▶";
  else if (name === "arrow-right" || name === "ChevronForward") iconChar = "→";
  else if (name === "copy" || name === "Copy") iconChar = "📋";
  else if (name === "info" || name === "Info" || name === "InformationCircle") iconChar = "ℹ️";
  else if (name === "person" || name === "Person") iconChar = "👤";
  else if (name === "person-add" || name === "PersonAdd") iconChar = "➕";
  else if (name === "time" || name === "Time") iconChar = "🕒";
  else if (name === "location" || name === "Location") iconChar = "📍";
  else if (name === "hammer" || name === "Hammer") iconChar = "🔨";
  else if (name === "grid" || name === "Grid") iconChar = "🎛️";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        color,
        fontSize: size * 0.9,
        lineHeight: 1,
        ...style
      }}
    >
      {iconChar}
    </span>
  );
};

export const Feather = MockIcon;
export const Ionicons = MockIcon;

// Destructured individual icon exports for Ionicons in TasrifLughowiTab
export const Info = MockIcon;
export const Copy = MockIcon;
export const LockClosed = MockIcon;
export const Sparkles = MockIcon;
export const Book = MockIcon;
export const Pulse = MockIcon;
export const Ribbon = MockIcon;
export const Person = MockIcon;
export const PersonAdd = MockIcon;
export const Time = MockIcon;
export const Location = MockIcon;
export const Hammer = MockIcon;
export const ChevronForward = MockIcon;

// Destructured individual icon exports for MasdarTab
export const Grid = MockIcon;
export const InformationCircle = MockIcon;

// Additional icon sets
export const Lock = MockIcon;
export const ChevronLeft = MockIcon;
export const ChevronRight = MockIcon;

export default MockIcon;
