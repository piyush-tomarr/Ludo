const fs = require('fs');
const path = require('path');

const boardPath = path.join('d:', 'visiontrek a1', 'LudoEthopia', 'frontend', 'src', 'Components', 'Board.jsx');
const movingPawnPath = path.join('d:', 'visiontrek a1', 'LudoEthopia', 'frontend', 'src', 'Components', 'MovingPawn.jsx');

let boardContent = fs.readFileSync(boardPath, 'utf8');
let movingPawnContent = fs.readFileSync(movingPawnPath, 'utf8');

// 1. Fix normalizeColor in Board.jsx
boardContent = boardContent.replace(
  /const normalizeColor \= \(color\) \=\> \{[\s\S]*?return lower;\n\};/,
  `const normalizeColor = (color) => {
  if (!color) return color;
  const lower = color.trim().toLowerCase();
  if (lower === "#fad416" || lower === "#fbc02d" || lower === "#ffeb3b" || lower === "#fdd835") return "#fad416";
  return lower;
};`
);

// 2. Fix normalizeColor in MovingPawn.jsx
movingPawnContent = movingPawnContent.replace(
  /const normalizeColor \= \(color\) \=\> \{[\s\S]*?return lower;\n\};/,
  `const normalizeColor = (color) => {
  if (!color) return color;
  const lower = color.trim().toLowerCase();
  if (lower === "#fad416" || lower === "#fbc02d" || lower === "#ffeb3b" || lower === "#fdd835") return "#fad416";
  return lower;
};`
);

// 3. Fix STICKERS in Board.jsx
const stickersReplacement = `import emojilib from 'emojilib';

const getEmoji = (searchKeys) => {
  for (const [emoji, tags] of Object.entries(emojilib)) {
    if (searchKeys.some(key => tags.includes(key))) {
      return emoji;
    }
  }
  return '⭐'; // fallback
};

const STICKERS = [
  { id: 'baby', emoji: getEmoji(['baby']), cost: 50, label: 'Baby' },
  { id: 'dice3', emoji: getEmoji(['dice', 'game_die']), cost: 25, label: 'Lucky 3' },
  { id: 'fist', emoji: getEmoji(['fist']), cost: 30, label: 'Power' },
  { id: 'flower', emoji: getEmoji(['rose', 'flower']), cost: 1, label: 'Love' },
  { id: 'muscle', emoji: getEmoji(['muscle']), cost: 40, label: 'Strong' },
  { id: 'thinking', emoji: getEmoji(['thinking', 'thinking_face']), cost: 30, label: 'Hmm...' },
  { id: 'begging', emoji: getEmoji(['pray', 'pleading']), cost: 40, label: 'Please' },
  { id: 'sad', emoji: getEmoji(['cry', 'sad']), cost: 30, label: 'Nooo' },
  { id: 'punch', emoji: getEmoji(['punch']), cost: 40, label: 'Bam!' },
  { id: 'smile', emoji: getEmoji(['smile', 'blush']), cost: 25, label: 'Happy' },
  { id: 'fire', emoji: getEmoji(['fire']), cost: 25, label: 'Hot!' },
  { id: 'thumbsup', emoji: getEmoji(['thumbsup', '+1']), cost: 40, label: 'Nice' },
  { id: 'tomato', emoji: getEmoji(['tomato']), cost: 50, label: 'Boo!' },
  { id: 'thumbsdown', emoji: getEmoji(['thumbsdown', '-1']), cost: 50, label: 'Bad' },
  { id: 'dice4', emoji: getEmoji(['dice', 'game_die']), cost: 25, label: 'Lucky 4' },
  { id: 'dice5', emoji: getEmoji(['dice', 'game_die']), cost: 25, label: 'Lucky 5' },
  { id: 'wink', emoji: getEmoji(['wink']), cost: 25, label: 'Wink' },
  { id: 'angry', emoji: getEmoji(['angry', 'rage']), cost: 25, label: 'Mad' },
  { id: 'hammer', emoji: getEmoji(['hammer']), cost: 25, label: 'Hammer' },
  { id: 'prayer', emoji: getEmoji(['pray', 'palms_up_together']), cost: 40, label: 'Prayer' },
];`;

boardContent = boardContent.replace(/const STICKERS = \[[\s\S]*?\];/, stickersReplacement);

if (!boardContent.includes("import emojilib from 'emojilib';") && !boardContent.includes("const STICKERS = [")) {
  console.log("Failed to replace STICKERS array in Board.jsx");
}

fs.writeFileSync(boardPath, boardContent, 'utf8');
fs.writeFileSync(movingPawnPath, movingPawnContent, 'utf8');
console.log('Update successful');
