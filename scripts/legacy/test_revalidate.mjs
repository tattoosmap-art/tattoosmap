import fs from 'fs/promises';

async function run() {
    console.log("Testing Revalidation...");
    try {
        const res = await fetch("http://localhost:3000/api/admin/sync?action=revalidate", { method: "POST" });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log(`Response: `, data);
    } catch(e) {
        console.error(`Revalidation error: ${e.message}`);
    }
}

run();
