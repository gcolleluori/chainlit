# Custom Emojis

Place custom emoji PNG files in this directory.

## Naming Convention

- File names should match the emoji shortcode (e.g., `drake-yes.png` for `:drake-yes:`)
- Use lowercase names with hyphens for multi-word emojis
- PNG format is recommended for best quality

## Adding New Emojis

1. Add the PNG file to this directory (e.g., `my-emoji.png`)
2. Register the emoji name in `src/lib/remarkCustomEmoji.ts` by adding it to the `CUSTOM_EMOJIS` set:

```typescript
const CUSTOM_EMOJIS = new Set([
  'drake-yes',
  'drake-no',
  'my-emoji',  // Add your new emoji here
]);
```

## Usage

Use the emoji in messages like: `:drake-yes:` or `:drake-no:`

## Recommended Size

- 64x64 pixels or 128x128 pixels for best results
- They will be displayed at 1.2em height inline with text

