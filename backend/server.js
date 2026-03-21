import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Read API key from environment variable
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error("Missing GROQ_API_KEY environment variable");
}

app.post("/api/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: "user", content: userMessage }
                    ]
                })
            }
        );

        const data = await response.json();
        console.log("GROQ RAW RESPONSE:", data);

        const aiText =
            data.choices?.[0]?.message?.content ||
            data.error?.message ||
            "AI Error: No response";

        res.json({ reply: aiText });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.json({ reply: "AI Error: Server failed to respond." });
    }
});

app.listen(3000, () => {
    console.log("Orbiter AI server running on http://localhost:3000");
});
