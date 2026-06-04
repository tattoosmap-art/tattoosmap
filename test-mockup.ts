import { generateMockupsForDesign } from "./src/lib/mockup-generator";

async function run() {
    try {
        console.log("Running...");
        const res = await generateMockupsForDesign(
            "https://smrnldmbvtflavzswghh.supabase.co/storage/v1/object/public/designs/fine-line-crescent-moon-and-floral-bouquet-delicate-cm.webp",
            "forearm",
            "test-slug-123"
        );
        console.log(res);
    } catch (e) {
        console.error(e);
    }
}
run();
