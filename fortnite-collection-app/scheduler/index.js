const cron = require("node-cron");
const http = require("http");

const APP_URL = process.env.APP_URL || "http://app:3000";
const CYCLE_TOKEN = process.env.CYCLE_TOKEN || "changeme";

console.log(`[scheduler] starting. APP_URL=${APP_URL}, triggering at 12:00 UTC daily`);

// Every day at 12:00 UTC
cron.schedule("0 12 * * *", async () => {
  console.log(`[scheduler] triggered at ${new Date().toISOString()}`);
  
  try {
    const url = new URL("/api/cycle", APP_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CYCLE_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`[scheduler] response status ${res.statusCode}`);
        console.log(`[scheduler] response body: ${data}`);
      });
    });

    req.on("error", (e) => {
      console.error(`[scheduler] error: ${e.message}`);
    });

    req.end();
  } catch (e) {
    console.error(`[scheduler] exception: ${e.message}`);
  }
});

console.log("[scheduler] ready. cron job scheduled for 12:00 UTC daily.");
