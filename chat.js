import { openai } from "./openai.js";
import readline from "node:readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function newMessage(history, message) {
    const results = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [...history, message],
    });

    return results.choices[0].message;
}

function format(userInput) {
    return {
        role: "user",
        content: userInput,
    };
}

function chat() {
    const history = [
        {
            role: "system",
            content: "You are an AI assistant. Answer questions or else!",
        },
    ];

    const start = () => {
        rl.question("You: ", async (userInput) => {
            if (userInput.toLocaleLowerCase() == "exit") {
                rl.close();
                return;
            }

            const message = format(userInput);
            const response = await newMessage(history, message);
            history.push(message, response);
            console.log(`\n\nAI: ${response.content}`);
            start();
        });
    };

    start();
}

console.log("Chatbot initialized. Type 'exit' to end the chat");
chat();
