import React from "react";

interface HtmlContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export const HtmlContent: React.FC<HtmlContentProps> = ({
  content,
  className = "",
  style,
}) => {
  return (
    <div
      className={`html-content leading-relaxed text-slate-700 dark:text-slate-300 transition-colors ${className}`}
      style={{
        ...style,
        display: "block",
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
