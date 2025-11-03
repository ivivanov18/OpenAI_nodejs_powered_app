import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI();
const results = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "system",
            content:
                "you are an ai assistant. answer any questions to be best of your ability",
        },
        {
            role: "user",
            content: "hi",
        },
    ],
});
console.log(results.choices[0]);
