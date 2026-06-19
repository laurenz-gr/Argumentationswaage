import type { ReactNode } from 'react';
import { parseMarkdownLight, type MarkdownNode } from '@/domain/markdown';

function renderNodes(nodes: MarkdownNode[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return <span key={index}>{node.value}</span>;
      case 'strong':
        return <strong key={index}>{renderNodes(node.children)}</strong>;
      case 'em':
        return <em key={index}>{renderNodes(node.children)}</em>;
      case 'link':
        return (
          <a
            key={index}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            {renderNodes(node.children)}
          </a>
        );
      default: {
        const exhaustive: never = node;
        return exhaustive;
      }
    }
  });
}

interface MarkdownTextProps {
  source: string;
}

export function MarkdownText({ source }: MarkdownTextProps) {
  return <>{renderNodes(parseMarkdownLight(source))}</>;
}
