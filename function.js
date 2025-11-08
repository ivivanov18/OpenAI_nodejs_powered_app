import math from "advanced-math";
import { openai } from "./openai.js";

const question = process.argv[2] || "hi";

const messages = [
    {
        role: "user",
        content: question,
    },
];

const functions = {
    calculate({ expression }) {
        return math.evaluate(expression);
    },
};

async function getCompletions(message) {
    return openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0,
        function_call: { name: "calculate" },
        function: [
            {
                name: "calculate",
                description: "run maths expressions",
                parameters: {
                    expression: {
                        type: "string",
                        description:
                            "the math expression to evaluate '2 * 3 + (21/2) ^ 2'",
                    },
                },
                required: ["expression"],
            },
        ],
    });
}

let response;

while (true) {
    response = await getCompletions(message);
}
