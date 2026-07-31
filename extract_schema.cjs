const fs = require('fs');
const text = fs.readFileSync('c:/Users/HMEM/Downloads/newsystem_merged.sql', 'utf8');

function extractTable(tableName) {
    const startStr = `CREATE TABLE \`${tableName}\``;
    const start = text.indexOf(startStr);
    if (start === -1) return `${tableName} not found`;
    const end = text.indexOf(') ENGINE=', start);
    return text.substring(start, end + 1);
}

console.log('--- PROFILES ---');
console.log(extractTable('profiles'));

console.log('\n--- ASSIGNMENTS ---');
console.log(extractTable('assignments'));
