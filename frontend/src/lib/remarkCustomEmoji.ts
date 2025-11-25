import { visit } from 'unist-util-visit';

/**
 * A list of known custom emoji names (normalized with hyphens).
 * Only these emojis will be transformed to images.
 * Others like :emoji: will be left as-is to preserve standard Slack/Discord emoji names.
 *
 * Note: Both underscore and hyphen versions are supported in text.
 * e.g., :drake_yes: and :drake-yes: both work.
 */
const CUSTOM_EMOJIS = new Set([
  'drake-yes',
  'drake-no'
  // Add more custom emojis here as needed
]);

/**
 * Normalize emoji name by converting underscores to hyphens.
 * This allows both :drake_yes: and :drake-yes: to work.
 */
const normalizeEmojiName = (name: string): string => {
  return name.replace(/_/g, '-');
};

/**
 * Remark plugin to transform custom emoji syntax :emoji-name: into custom nodes.
 *
 * This plugin looks for text patterns matching :emoji-name: where the name
 * is in the CUSTOM_EMOJIS set, and transforms them into special nodes that
 * get rendered as images.
 *
 * Example:
 *   Input: "Great job! :drake-yes:"
 *   Output: "Great job! " + <customEmoji name="drake-yes" />
 */
const remarkCustomEmoji = () => {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index, parent) => {
      // Match :emoji-name: pattern where name contains letters, numbers, hyphens, underscores
      const emojiPattern = /:([a-zA-Z0-9_-]+):/g;
      const matches = [...(node.value?.matchAll(emojiPattern) || [])];

      // Filter to only custom emojis we know about (normalize to check)
      const validMatches = matches.filter((match) =>
        CUSTOM_EMOJIS.has(normalizeEmojiName(match[1]))
      );

      if (validMatches.length > 0) {
        const newNodes: any[] = [];
        let lastIndex = 0;

        validMatches.forEach((match) => {
          const [fullMatch, rawEmojiName] = match;
          // Normalize the emoji name (convert underscores to hyphens)
          const emojiName = normalizeEmojiName(rawEmojiName);
          const startIndex = match.index!;
          const endIndex = startIndex + fullMatch.length;

          // Add any text before this emoji
          if (startIndex > lastIndex) {
            newNodes.push({
              type: 'text',
              value: node.value!.slice(lastIndex, startIndex)
            });
          }

          // Add the custom emoji node
          newNodes.push({
            type: 'customEmoji',
            data: {
              hName: 'customEmoji',
              hProperties: { name: emojiName }
            }
          });

          lastIndex = endIndex;
        });

        // Add any remaining text after the last emoji
        if (lastIndex < node.value!.length) {
          newNodes.push({
            type: 'text',
            value: node.value!.slice(lastIndex)
          });
        }

        // Replace the original node with our new nodes
        parent!.children.splice(index, 1, ...newNodes);
      }
    });
  };
};

export { remarkCustomEmoji, CUSTOM_EMOJIS };
