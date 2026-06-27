// import React, { useEffect } from 'react';
// import { init } from 'emoji-mart';
// import data from '@emoji-mart/data';

// // Initialize emoji-mart with local data
// init({ data });

// const Emoji = ({ id, size = '1em', native = false }) => {
//   if (native) {
//     // If we just want the native character but still using the library's data source
//     // This is useful if we want to ensure any logic around emoji-mart is respected
//     return <span style={{ fontSize: size }}>{id}</span>;
//   }

//   // Use the web component provided by emoji-mart v5
//   return (
//     <em-emoji
//       id={id}
//       size={size}
//     ></em-emoji>
//   );
// };

// export default Emoji;



import React from 'react';
import data from '@emoji-mart/data';

const emojiMap = {};
for (const [, emoji] of Object.entries(data.emojis)) {
  emojiMap[emoji.id] = emoji.skins[0].unified; // unicode codepoint e.g. "1fa99"
  if (emoji.aliases) {
    emoji.aliases.forEach(alias => {
      emojiMap[alias] = emoji.skins[0].unified;
    });
  }
}

const Emoji = ({ id, size = '1em' }) => {
  const unified = emojiMap[id];

  if (!unified) {
    console.warn(`Emoji not found: ${id}`);
    return null;
  }

  // Twemoji CDN — images work on ALL devices regardless of OS/font
  const twemojiUrl = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${unified.toLowerCase()}.svg`;

  return (
    <img
      src={twemojiUrl}
      alt={id}
      role="img"
      aria-label={id}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        verticalAlign: '-0.1em',
      }}
    />
  );
};

export default Emoji;