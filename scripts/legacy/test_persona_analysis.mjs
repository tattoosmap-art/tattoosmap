import fs from 'fs/promises';
import path from 'path';

const TEST_IMAGE = 'fine-line-crescent-moon-and-floral-bouquet-delicate-cm.webp';
const IMAGE_PATH = path.join(process.cwd(), 'public', 'designs', TEST_IMAGE);

async function runTest() {
    console.log(`🚀 Starting Persona-Driven Validation Test for: ${TEST_IMAGE}`);
    
    try {
        const buffer = await fs.readFile(IMAGE_PATH);
        const file = new File([buffer], TEST_IMAGE, { type: 'image/webp' });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('previousFilenames', JSON.stringify([]));
        
        const response = await fetch('http://localhost:3000/api/process-design', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${error}`);
        }

        const data = await response.json();
        
        console.log('\n--- 💎 COMPLETE PERSONA-DRIVEN ANALYSIS JSON ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('--- 💎 END OF DATA ---');
        
        console.log('\n✅ Validation successful. Please review the specificity of the "meaning" and "artist_technical_notes" fields.');
        
    } catch (err) {
        console.error('❌ Validation Test Failed:', err.message);
    }
}

runTest();
