import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { CharacterTextSplitter } from "@langchain/textsplitters";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { openai } from "./openai.js";

const question = process.argv[2];
const video = "https://youtu.be/zR_iuq2evXo?si=cG8rODgRgXOx9_Cn";

async function docsFromVideo() {
    const loader = YoutubeLoader.createFromUrl(video, {
        language: "en",
        addVideoInfo: true,
    });
    const loadedDoc = await loader.load();
    const splitter = new CharacterTextSplitter({
        separator: " ",
        chunkSize: 2500,
        chunkOverlap: 200,
    });
    return await splitter.splitDocuments(loadedDoc);
}

async function docsFromPDF() {
    const loader = new PDFLoader("./xbox.pdf");
    const loadedDoc = await loader.load();
    const splitter = new CharacterTextSplitter({
        separator: ". ",
        chunkSize: 2500,
        chunkOverlap: 200,
    });
    return await splitter.splitDocuments(loadedDoc);
}

function createStore(docs) {
    return MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());
}

async function loadStore() {
    const videos = await docsFromVideo();
    const pdfDocs = await docsFromPDF();

    return createStore([...videos, ...pdfDocs]);
}

async function query() {
    const store = await loadStore();
    const results = await store.similaritySearch(question, 2);
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0,
        messages: [
            {
                role: "system",
                content:
                    "You are helpful AI system. Answer the questions to your best ability!",
            },
            {
                role: "user",
                content: `Answer the following question using the provided context. If you cannot answer the question with the question, don't lie and make up stuff. Just say you need more context.
                Question: ${question}
                Context: ${results.map((r) => r.pageContent).join("\n")}`,
            },
        ],
    });
    console.log({ response });
    console.log(`Answer: ${response.choices[0].message.content}\n
        Sources:${results.map((r) => r.metadata.source).join(", ")}`);
}

query();
