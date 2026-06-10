import fs from 'fs/promises';

async function run() {
    console.log("Starting draft mock sync test...");

    const mockRowReview = {
        slug: "draft-review-design",
        seo_filename: "missing-file.webp", // even if missing, it shouldn't crash because storage is skipped!
        thumbnail_filename: "missing-thumb.webp",
        subject: "test review subject",
        public_category: "minimalist-objects", 
        alt_text: "draft alt",
        speakable_summary: "draft summary",
        status: "REVIEW",
        ip_flag: "FALSE"
    };

    const mockRowIP = {
        slug: "draft-ip-design",
        seo_filename: "missing-ip-file.webp",
        thumbnail_filename: "missing-ip-thumb.webp",
        subject: "test ip subject",
        public_category: "minimalist-objects", 
        alt_text: "ip alt",
        speakable_summary: "ip summary",
        status: "READY",
        ip_flag: "TRUE" // Should force draft
    };

    const rows = [mockRowReview, mockRowIP];

    for (const row of rows) {
        console.log(`\nTesting API with slug: ${row.slug}`);
        try {
            const res = await fetch("http://localhost:3000/api/admin/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ row })
            });

            const text = await res.text();
            console.log(`Status: ${res.status}`);
            try {
                console.log(`Response Data:`, JSON.parse(text));
            } catch (e) {
                console.log(`HTML Error Returned (first 200 chars):`, text.substring(0, 200));
            }
        } catch (e) {
            console.error(`Error fetching API for ${row.slug}: ${e.message}`);
        }
    }
}

run();
