import type { ReactNode } from "react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

function safeUrl(value: string): string | null {
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(!?\[[^\]]*\]\([^)]*\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const token = match[0];
    const tokenKey = `${keyPrefix}-${key++}`;

    if (token.startsWith("![")) {
      const imageMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        const src = safeUrl(imageMatch[2].trim());
        if (src) {
          nodes.push(
            <img
              key={tokenKey}
              className="blog-content-image"
              src={src}
              alt={imageMatch[1] || "Article image"}
              loading="lazy"
            />
          );
        } else {
          nodes.push(imageMatch[1] || "[image]");
        }
      }
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const href = safeUrl(linkMatch[2].trim());
        nodes.push(
          href ? (
            <a key={tokenKey} href={href} target="_blank" rel="noreferrer">
              {linkMatch[1]}
            </a>
          ) : (
            linkMatch[1]
          )
        );
      }
    } else if (token.startsWith("`")) {
      nodes.push(<code key={tokenKey}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(<strong key={tokenKey}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={tokenKey}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function MarkdownContent({ content, className = "blog-markdown" }: MarkdownContentProps) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: { ordered: boolean; text: string }[] = [];
  let quoteLines: string[] = [];
  let codeLines: string[] = [];
  let codeLanguage = "";
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(
      <p key={`p-${blocks.length}`}>{renderInline(paragraph.join(" "), `p-${blocks.length}`)}</p>
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    const ordered = listItems[0].ordered;
    const items = listItems;
    const key = `list-${blocks.length}`;
    blocks.push(
      ordered ? (
        <ol key={key}>{items.map((item, index) => <li key={`${key}-${index}`}>{renderInline(item.text, `${key}-${index}`)}</li>)}</ol>
      ) : (
        <ul key={key}>{items.map((item, index) => <li key={`${key}-${index}`}>{renderInline(item.text, `${key}-${index}`)}</li>)}</ul>
      )
    );
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    const key = `quote-${blocks.length}`;
    blocks.push(
      <blockquote key={key}>
        {quoteLines.map((line, index) => (
          <p key={`${key}-${index}`}>{renderInline(line, `${key}-${index}`)}</p>
        ))}
      </blockquote>
    );
    quoteLines = [];
  };

  const flushCode = () => {
    if (!codeLines.length && !inCode) return;
    blocks.push(
      <pre key={`code-${blocks.length}`}>
        <code data-language={codeLanguage || undefined}>{codeLines.join("\n")}</code>
      </pre>
    );
    codeLines = [];
    codeLanguage = "";
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (inCode) {
      if (/^```/.test(trimmed)) {
        flushCode();
        inCode = false;
      } else {
        codeLines.push(line);
      }
      return;
    }

    if (/^```/.test(trimmed)) {
      flushAll();
      inCode = true;
      codeLanguage = trimmed.slice(3).trim();
      return;
    }

    if (!trimmed) {
      flushAll();
      return;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const contentNode = renderInline(heading[2], `h-${index}`);
      if (level === 1) blocks.push(<h2 key={`h-${index}`}>{contentNode}</h2>);
      if (level === 2) blocks.push(<h3 key={`h-${index}`}>{contentNode}</h3>);
      if (level === 3) blocks.push(<h4 key={`h-${index}`}>{contentNode}</h4>);
      return;
    }

    const horizontalRule = /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed);
    if (horizontalRule) {
      flushAll();
      blocks.push(<hr key={`hr-${index}`} />);
      return;
    }

    const quote = trimmed.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      return;
    }

    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
    if (ordered || unordered) {
      flushParagraph();
      flushQuote();
      listItems.push({ ordered: Boolean(ordered), text: (ordered || unordered)![1] });
      return;
    }

    if (listItems.length) {
      flushList();
    }
    if (quoteLines.length) {
      flushQuote();
    }
    paragraph.push(trimmed);
  });

  if (inCode) flushCode();
  flushAll();

  return <div className={className}>{blocks}</div>;
}

export default MarkdownContent;
