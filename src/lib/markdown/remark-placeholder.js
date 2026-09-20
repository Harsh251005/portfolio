import { visit } from 'unist-util-visit';

/**
 * Wraps any ⟨ ... ⟩ passage in <span class="todo">, so unfinished
 * copy is visually loud on the page rather than blending in.
 *
 * The point is that draft text cannot be shipped by accident.
 */
export function remarkPlaceholder() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null || !node.value.includes('⟨')) return;

      const parts = node.value.split(/(⟨[^⟩]*⟩)/g).filter(Boolean);
      if (parts.length < 2) return;

      parent.children.splice(
        index,
        1,
        ...parts.map((value) =>
          value.startsWith('⟨')
            ? {
                type: 'emphasis',
                data: { hName: 'span', hProperties: { class: 'todo' } },
                children: [{ type: 'text', value }],
              }
            : { type: 'text', value },
        ),
      );
      return index + parts.length;
    });
  };
}
