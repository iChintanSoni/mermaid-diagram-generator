"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { marked, type RendererObject, type Tokens } from "marked";
import mermaid from "mermaid";
import { ArrowUpIcon, CopyIcon } from "lucide-react";
import { Button } from "./ui/button";

type MarkdownViewerProps = {
  markdown: string;
  className?: string;
};

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
});

/**
 * Typed Marked Renderer (Tailwind-friendly HTML)
 */
const renderer: RendererObject = {
  code(token: Tokens.Code) {
    const { text, lang } = token;

    if (lang === "mermaid") {
      return `<div class="mermaid my-3">${text}</div>`;
    }

    return `
      <pre class="my-3 overflow-x-auto rounded-md bg-zinc-900 text-zinc-100 text-xs p-3">
        <code class="language-${lang ?? ""}">
          ${escapeHtml(text)}
        </code>
      </pre>
    `;
  },

  image(token: Tokens.Image) {
    const { href, title, text } = token;
    if (!href) return "";

    return `
      <img
        src="${href}"
        alt="${text}"
        title="${title ?? ""}"
        loading="lazy"
        class="my-3 max-w-full rounded-md border"
      />
    `;
  },
};

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  markdown,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    marked.use({
      renderer,
      gfm: true,
      breaks: true,
    });

    return marked.parse(markdown, { async: false });
  }, [markdown]);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes =
      containerRef.current.querySelectorAll<HTMLElement>(".mermaid");

    if (nodes.length > 0) {
      mermaid.run({ nodes: Array.from(nodes) });
    }
  }, [html]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Copy button (top-right, subtle) */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Copy"
        className="absolute right-1 top-1"
        onClick={handleCopy}
      >
        <CopyIcon />
      </Button>

      {/* Markdown content */}
      <div
        ref={containerRef}
        className="
          markdown-content
          prose prose-sm max-w-none
          prose-p:my-2
          prose-ul:my-2
          prose-ol:my-2
          prose-li:my-0
          prose-pre:my-3
          prose-img:my-3
          prose-code:before:content-none
          prose-code:after:content-none
        "
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
