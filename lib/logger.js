const log = require('npmlog');

// Style helpers
const bold = (txt) => `\x1b[1m${txt}\x1b[22m`;
const yellow = (txt) => `\x1b[33m${txt}\x1b[0m`;

// Build heading: ">" (yellow+bold) + " fca-unofficial" (bold)
log.heading = `\x1b[1m${yellow('>')} fca-unofficial\x1b[22m`;

// Customize levels
log.addLevel('warn',  1000, { fg: 'yellow' }, 'WARN');
log.addLevel('error', 2000, { fg: 'red' }, 'ERROR');
log.addLevel('info',  3000, { fg: 'blue' }, 'INFO');

module.exports = (text, type = 'info') => {
  const msg = bold(text);

  switch (type) {
    case 'warn':
      log.warn('', msg);
      break;
    case 'error':
      log.error('', msg);
      break;
    case 'info':
      log.info('', msg);
      break;
    default:
      log.info('', msg);
      break;
  }
};
