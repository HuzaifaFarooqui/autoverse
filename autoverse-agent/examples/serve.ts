import { startServer } from "../src/server";
import * as dotenv from "dotenv";

dotenv.config();

startServer({
    groqModel: process.env.GROQ_MODEL || "llama3-8b-8192",
    groqBaseUrl: "https://api.groq.com/openai/v1",
    port: parseInt(process.env.PORT || "3000"),
    publicUrl: process.env.PUBLIC_URL,
    verbose: true,
});
