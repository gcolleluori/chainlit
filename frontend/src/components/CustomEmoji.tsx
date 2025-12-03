import { useContext } from 'react';

import { ChainlitContext } from '@chainlit/react-client';

interface CustomEmojiProps {
  name: string;
  alt?: string;
}

/**
 * Renders a custom emoji image from the /public/emojis/ directory.
 * Supports custom Slack-style emojis like :drake-yes: and :drake-no:
 */
const CustomEmoji = ({ name, alt }: CustomEmojiProps) => {
  const apiClient = useContext(ChainlitContext);

  // Build the URL for the emoji image
  // Emojis are stored in /public/emojis/{name}.png
  const emojiSrc = apiClient.buildEndpoint(`/public/emojis/${name}.png`);

  return (
    <img
      src={emojiSrc}
      alt={alt || `:${name}:`}
      title={`:${name}:`}
      className="inline-block align-middle h-[1.2em] w-auto"
      style={{
        verticalAlign: 'middle',
        display: 'inline-block'
      }}
      onError={(e) => {
        // If emoji image fails to load, show the original text
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        // Create a text node as fallback
        const textNode = document.createTextNode(`:${name}:`);
        target.parentNode?.replaceChild(textNode, target);
      }}
    />
  );
};

export { CustomEmoji };

