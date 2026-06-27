const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function fixEncoding(text) {
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
    "ðŸ¤²": "🤲",
    "🪙": "🪙",     // Let's protect these if needed
    "ðŸª™": "🪙",   // Hex for coin ? Actually Coin emoji is \u{1FA99} -> utf8 F0 9F AA 99 -> ðŸª™
    "ðŸ ’": "💰",
    "ðŸ”’": "🔒",
    "ðŸ“§": "📧",
    "ðŸ“ž": "📞",
    "ðŸ•’": "🕒"
  };

  for (const [bad, good] of Object.entries(replacements)) {
    if (bad !== good) {
      str = str.split(bad).join(good);
    }
  }
  return str;
}

const rootDirs = [
  'd:/visiontrek a1/LudoEthopia/frontend/src',
  'd:/visiontrek a1/LudoEthopia/backend'
];

for (const dir of rootDirs) {
  walkDir(dir, (filepath) => {
    if (filepath.endsWith('.jsx') || filepath.endsWith('.js') || filepath.endsWith('.css')) {
      let content = fs.readFileSync(filepath, 'utf8');
      let fixed = fixEncoding(content);
      if (fixed !== content) {
        fs.writeFileSync(filepath, fixed, 'utf8');
        console.log('Fixed:', filepath);
      }
    }
  });
}
