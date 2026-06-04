import { generateMockupsForDesign } from "./src/lib/mockup-generator";
import fs from "fs";

async function run() {
    try {
        console.log("Running...");
        const designBuffer = fs.readFileSync("./public/brand-logo.png"); // dummy image
        const res = await generateMockupsForDesign(
            designBuffer,
            "forearm",
            "test-slug-123"
        );
        console.log("Result keys:", Object.keys(res));
    } catch (e) {
        console.error("Error generating mockups:", e);
    }
}
run();
