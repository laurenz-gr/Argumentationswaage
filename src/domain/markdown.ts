export type MarkdownNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: MarkdownNode[] }
  | { type: 'em'; children: MarkdownNode[] }
  | { type: 'link'; href: string; children: MarkdownNode[] };

const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;
const AUTOLINK_PATTERN = /(https?:\/\/[^\s]+)/;
const BOLD_PATTERN = /\*\*(.+?)\*\*/;
const ITALIC_PATTERN = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/;

export function parseMarkdownLight(source: string): MarkdownNode[] {
  return tokenize(source);
}

function tokenize(source: string): MarkdownNode[] {
  if (!source) {
    return [];
  }

  const linkMatch = source.match(LINK_PATTERN);
  if (linkMatch && linkMatch.index !== undefined) {
    const before = source.slice(0, linkMatch.index);
    const after = source.slice(linkMatch.index + linkMatch[0].length);
    return [
      ...tokenize(before),
      {
        type: 'link',
        href: linkMatch[2],
        children: tokenize(linkMatch[1]),
      },
      ...tokenize(after),
    ];
  }

  const autoLinkMatch = source.match(AUTOLINK_PATTERN);
  if (autoLinkMatch && autoLinkMatch.index !== undefined) {
    const before = source.slice(0, autoLinkMatch.index);
    const after = source.slice(autoLinkMatch.index + autoLinkMatch[0].length);
    return [
      ...tokenize(before),
      {
        type: 'link',
        href: autoLinkMatch[1],
        children: [{ type: 'text', value: autoLinkMatch[1] }],
      },
      ...tokenize(after),
    ];
  }

  const boldMatch = source.match(BOLD_PATTERN);
  if (boldMatch && boldMatch.index !== undefined) {
    const before = source.slice(0, boldMatch.index);
    const after = source.slice(boldMatch.index + boldMatch[0].length);
    return [
      ...tokenize(before),
      { type: 'strong', children: tokenize(boldMatch[1]) },
      ...tokenize(after),
    ];
  }

  const italicMatch = source.match(ITALIC_PATTERN);
  if (italicMatch && italicMatch.index !== undefined) {
    const before = source.slice(0, italicMatch.index);
    const after = source.slice(italicMatch.index + italicMatch[0].length);
    return [
      ...tokenize(before),
      { type: 'em', children: tokenize(italicMatch[1]) },
      ...tokenize(after),
    ];
  }

  return [{ type: 'text', value: source }];
}
