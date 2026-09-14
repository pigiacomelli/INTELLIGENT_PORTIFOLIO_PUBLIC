const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '../index.ts');
let content = fs.readFileSync(indexFile, 'utf8');

if (content.includes('console.')) {
    if (!content.includes('logger.js')) {
        content = `import { logger } from './utils/logger.js';\n` + content;
    }
    content = content.replace(/console\.log\(/g, 'logger.info(');
    content = content.replace(/console\.error\(/g, 'logger.error(');
    content = content.replace(/console\.warn\(/g, 'logger.warn(');

    fs.writeFileSync(indexFile, content, 'utf8');
    console.log('Updated index.ts');
}
