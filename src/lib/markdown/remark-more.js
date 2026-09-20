import { visit } from 'unist-util-visit';

/**
 * Turns this, in any knowledge Markdown file:
 *
 *   :::more[How it actually works]
 *   The technical version.
 *   :::
 *
 * into a collapsed <details>, so the plain-English answer always
 * comes first and the jargon is opt-in.
 *
 * Authors write prose. They never touch HTML.
 */
export function remarkMore() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective' || node.name !== 'more') return;

      const label = node.children[0]?.data?.directiveLabel
        ? node.children.shift()
        : null;

      const summaryText = label
        ? label.children.map((c) => c.value ?? '').join('')
        : 'Explain more';

      node.data = {
        ...node.data,
        hName: 'details',
        hProperties: { class: 'more' },
      };

      node.children.unshift({
        type: 'paragraph',
        data: { hName: 'summary', hProperties: { class: 'more__summary' } },
        children: [{ type: 'text', value: summaryText }],
      });
    });
  };
}
