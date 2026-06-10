import fs from 'fs';
import path from 'path';

function parseCSVRow(str) {
    let result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
}

const findCSV = () => {
    const rootPath = path.join(process.cwd(), 'tattoosmap_seo_data_2026-03-30.csv');
    if (fs.existsSync(rootPath)) return rootPath;
    
    const dlPath = path.join(process.env.HOME || '', 'Downloads', 'tattoosmap_seo_data_2026-03-30.csv');
    if (fs.existsSync(dlPath)) return dlPath;
    
    return null;
}

const run = () => {
    console.log("--- SPRINT 3 PRE-FLIGHT ---");
    const csvPath = findCSV();
    if (!csvPath) {
        console.log("Error: CSV not found.");
        return;
    }
    console.log(`CSV Found: ${csvPath}`);
    
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const headers = parseCSVRow(lines[0]);
    
    const statIdx = headers.indexOf('status');
    const ipIdx = headers.indexOf('ip_flag');

    let total = 0, ready = 0, review = 0, error = 0, ipFlag = 0;

    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        if (row.length < headers.length) continue;
        total++;
        const stat = row[statIdx]?.trim();
        if (stat === 'READY') ready++;
        else if (stat === 'REVIEW') review++;
        else if (stat === 'ERROR') error++;
        
        if (ipIdx !== -1 && row[ipIdx]?.trim() === 'TRUE') ipFlag++;
    }

    console.log(`Total Rows (excluding header): ${total}`);
    console.log(`READY: ${ready}`);
    console.log(`REVIEW: ${review}`);
    console.log(`ERROR: ${error}`);
    console.log(`IP FLAG TRUE: ${ipFlag}`);

    const designsDir = path.join(process.cwd(), 'public', 'designs');
    const thumbsDir = path.join(process.cwd(), 'public', 'designs', 'thumbs');

    let fullCount = 0, thumbCount = 0;
    if (fs.existsSync(designsDir)) fullCount = fs.readdirSync(designsDir).filter(f => f.endsWith('.webp')).length;
    if (fs.existsSync(thumbsDir)) thumbCount = fs.readdirSync(thumbsDir).filter(f => f.endsWith('.webp')).length;

    console.log(`Full-size WebP count: ${fullCount}`);
    console.log(`Thumbnail WebP count: ${thumbCount}`);
};

run();
