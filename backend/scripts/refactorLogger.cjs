const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '../services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
    const filePath = path.join(servicesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('console.')) {
        // Inject import 
        if (!content.includes('logger.js')) {
            content = `import { logger } from '../utils/logger.js';\n` + content;
        }
        content = content.replace(/console\.log\(/g, 'logger.info(');
        content = content.replace(/console\.error\(/g, 'logger.error(');
        content = content.replace(/console\.warn\(/g, 'logger.warn(');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
