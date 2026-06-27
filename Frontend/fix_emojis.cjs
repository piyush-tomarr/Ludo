const fs = require('fs');
const path = require('path');

const files = [
  'd:/visiontrek a1/LudoEthopia/frontend/src/Components/Board.jsx',
  'd:/visiontrek a1/LudoEthopia/frontend/src/Components/MovingPawn.jsx',
  'd:/visiontrek a1/LudoEthopia/frontend/src/Pages/MainMenu.jsx',
  'd:/visiontrek a1/LudoEthopia/frontend/src/Pages/Home.jsx',
  'd:/visiontrek a1/LudoEthopia/frontend/src/Pages/Leaderboard.jsx'
];

function fixEncoding(text) {
  // Convert string to bytes using Windows-1252 (approximate)
  // Actually, since Javascript doesn't have native win-1252, let's use the replacement map
  let str = text;
  const replacements = {
    "â†’": "→",
    "ðŸ †": "🏆",
    "ðŸ‘¥": "👥",
    "ðŸ‘¨â€ ðŸŽ¨": "👨‍🎨",
    "ðŸ•µï¸ â€ â™‚ï¸ ": "🕵️‍♂️",
    "ðŸš€": "🚀",
    "ðŸ›¡ï¸ ": "🛡️",
    "ðŸ”„": "🔄",
    "ðŸŽˆ": "🎈",
    "ðŸŽ ": "🎁",
    "ðŸ  ": "🏁",
    "ðŸ””": "🔔",
    "âš¡": "⚡",
    "ðŸ”Š": "🔊",
    "â ±ï¸ ": "⏱️",
    "â ²ï¸ ": "⏲️",
    "ðŸŽ²": "🎲",
    "â™Ÿï¸ ": "♟️",
    "ðŸ’°": "💰",
    "ðŸš«": "🚫",
    "ðŸ”“": "🔓",
    "ðŸ”’": "🔒",
    "ðŸ¤–": "🤖",
    "ðŸ§ ": "🧠",
    "â °": "⏰",
    "ðŸ’€": "💀",
    "ðŸ“¢": "📢",
    "ðŸ ·ï¸ ": "🏷️",
    "ðŸŽ¯": "🎯",
    "âš™ï¸ ": "⚙️",
    "ðŸšª": "🚪",
    "ðŸ’¬": "💬",
    "ðŸ‘‘": "👑",
    "â­ ": "⭐",
    "â Œ": "❌",
    "ðŸ©¸": "🩸",
    "ðŸ¥‡": "🥇",
    "ðŸ”¥": "🔥",
    "ðŸŒ ": "🌍",
    "ðŸ‘¶": "👶",
    "âœŠ": "✊",
    "ðŸŒ¹": "🌹",
    "ðŸ’ª": "💪",
    "ðŸ¤”": "🤔",
    "ðŸ™ ": "🙏",
    "ðŸ˜¢": "😢",
    "ðŸ‘Š": "👊",
    "ðŸ˜Š": "😊",
    "ðŸ‘ ": "👍",
    "ðŸ …": "🍅",
    "ðŸ‘Ž": "👎",
    "ðŸ˜‰": "😉",
    "ðŸ˜¡": "😡",
    "ðŸ”¨": "🔨",
    "ðŸ¤²": "🤲"
  };

  for (const [bad, good] of Object.entries(replacements)) {
    str = str.split(bad).join(good);
  }
  return str;
}

for (const filepath of files) {
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    let fixed = fixEncoding(content);
    if (fixed !== content) {
      fs.writeFileSync(filepath, fixed, 'utf8');
      console.log('Fixed:', filepath);
    }
  }
}
