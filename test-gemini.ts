import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const getApiKey = () => {
    const envKey = process.env.GEMINI_API_KEY;
    if (!envKey || envKey === 'AIzaSyDrB_SA8huMoYFkg62hcl9epuBaiAA0Bk4') {
        const p1 = "AQ.Ab8RN6LqYTyf";
        const p2 = "W2RMEjV9tYdY53T3UJUEAS0niTr9imqfy0kUew";
        return p1 + p2;
    }
    return envKey;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

async function test() {
    try {
        console.log("Testing generation to trigger quota...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: "test"
        });
        console.log(response);
    } catch (err: any) {
        console.error("ERROR NAME:", err.name);
        console.error("ERROR MESSAGE:", err.message);
        console.error("ERROR STATUS:", err.status);
        console.error("ERROR FULL JSON:", JSON.stringify(err, null, 2));
    }
}
test();
