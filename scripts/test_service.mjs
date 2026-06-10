import { designService } from './src/services/designService.js';
async function run() {
  const d = await designService.getDesigns();
  console.log("Returned Designs length:", d?.length);
  console.log("First Design:", JSON.stringify(d[0], null, 2));
}
run();
