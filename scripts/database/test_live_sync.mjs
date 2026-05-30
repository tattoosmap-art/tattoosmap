import fs from 'fs';
import Papa from 'papaparse';

async function testFullCSV() {
    console.log("Starting full CSV sync test...");
    
    // Read the perfectly formatted 4-row CSV from the Desktop!
    const csvContent = fs.readFileSync('/Users/killywilly/Desktop/Antigravity/tattoosmap/tattoosmap_seo_data_2026-03-30.csv', 'utf8');
    
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    
    if (parsed.errors.length > 0) {
        console.error("CSV Parse Errors:", parsed.errors);
        return;
    }
    
    const rows = parsed.data;
    console.log(`Loaded ${rows.length} rows for testing.`);

    let failures = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log(`\n[${i + 1}/${rows.length}] Syncing ${row.slug || "MISSING_SLUG"}...`);
        try {
            const res = await fetch("http://localhost:3000/api/admin/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ row })
            });

            const data = await res.json();
            
            if (!res.ok) {
                console.error(`Status ${res.status}:`, data.error);
                failures++;
            } else {
                console.log(`Success! Upserted as:`, data.dbStatus || data.message || "published");
            }
        } catch (e) {
            console.error(`Network Error: ${e.message}`);
            failures++;
        }
    }

    if (failures === 0) {
        console.log("\n======================================");
        console.log("✅ SYNC COMPLETELY SUCCESSFUL! ALL 4 ROWS PASSED!");
        console.log("======================================");
    } else {
         console.log(`\n❌ SYNC COMPLETED WITH ${failures} FAILURES`);
    }
}

testFullCSV();
