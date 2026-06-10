import fs from 'fs';
import Papa from 'papaparse';

const csvPath = '/Users/killywilly/Desktop/Antigravity/tattoosmap/tattoosmap_seo_data_2026-03-30.csv';
const content = fs.readFileSync(csvPath, 'utf8');

Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
        console.log(`Parsed ${results.data.length} rows`);
        if (results.errors.length > 0) {
            console.log("Errors:", results.errors);
        }
        if (results.data.length > 0) {
            console.log("First row slug:", results.data[0].slug);
        }
    }
});
