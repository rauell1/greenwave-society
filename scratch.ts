import { getDb } from "./src/lib/db";
async function run() {
  const admin = await getDb().adminUser.findFirst();
  console.log("First admin:", admin);
}
run();
