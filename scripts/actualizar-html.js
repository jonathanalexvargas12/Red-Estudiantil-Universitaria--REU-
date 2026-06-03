/**
 * Batch script for Fase 3:
 * - Replaces inline <header> with <div id="header-placeholder">
 * - Removes individual shared script tags, adds shared.js
 * - Handles both auth pages (with header) and recovery pages (without header)
 */
const fs = require('fs');
const path = require('path');

const htmlDir = path.resolve(__dirname, '../public/assets/html');
const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

let authCount = 0, recoveryCount = 0, unchangedCount = 0;

for (const file of files) {
    const filePath = path.join(htmlDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const orig = content;

    const hasHeader = /<header>/.test(content);
    const hasSharedScripts = /authValidation\.js/.test(content) || /Security_Scripts_092007\.js/.test(content);
    const hasTokenManager = /tokenManager\.js/.test(content);

    if (!hasSharedScripts && !hasTokenManager) {
        unchangedCount++;
        continue; // skip files that don't use shared scripts
    }

    // 1. Replace inline <header> with placeholder
    if (hasHeader) {
        // Match from <header> to </header> (including potential trailing spaces/newlines)
        content = content.replace(/<header>[\s\S]*?<\/header>\s*\n?/, '<div id="header-placeholder"></div>\n');
        authCount++;
    } else {
        recoveryCount++;
    }

    // 2. Remove individual script tags
    content = content.replace(/<script\s+src="\.\.\/js\/authValidation\.js"><\/script>\s*\n?/g, '');
    content = content.replace(/<script\s+src="\.\.\/js\/recarga_forzada\.js"><\/script>\s*\n?/g, '');
    content = content.replace(/<script\s+src="\.\.\/js\/Security_Scripts_092007\.js"><\/script>\s*\n?/g, '');
    content = content.replace(/<script\s+src="\.\.\/js\/general-app\.js"><\/script>\s*\n?/g, '');

    // 3. Add shared.js after tokenManager.js (for auth pages) or after CSS (for recovery pages)
    if (!/shared\.js/.test(content)) {
        if (hasTokenManager) {
            content = content.replace(
                /(<script\s+src="\.\.\/js\/tokenManager\.js"><\/script>)/,
                '$1\n    <script src="../js/shared.js"></script>'
            );
        } else {
            // Recovery pages: add shared.js after CSS link
            content = content.replace(
                /(<link\s+rel="stylesheet"\s+href="\.\.\/css\/estilo\.css">)/,
                '$1\n    <script src="../js/shared.js"></script>'
            );
        }
    }

    if (content !== orig) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  Updated: ${file}`);
    } else {
        unchangedCount++;
    }
}

console.log(`\nDone: ${authCount} auth pages, ${recoveryCount} recovery pages, ${unchangedCount} unchanged`);
