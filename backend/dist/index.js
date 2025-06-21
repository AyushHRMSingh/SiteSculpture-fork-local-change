"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
// import Anthropic from "@anthropic-ai/sdk";
const prompts_1 = require("./prompts");
// import { ContentBlock, TextBlock } from "@anthropic-ai/sdk/resources";
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const cors_1 = __importDefault(require("cors"));
const ollama_1 = require("ollama");
// const anthropic = new Anthropic();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const ollama = new ollama_1.Ollama();
ollama.list();
const basemodel = "phi4:latest";
// OLD CODE
// app.post("/template", async (req, res) => {
//     const prompt = req.body.prompt;
//     const response = await anthropic.messages.create({
//         messages: [{
//             role: 'user', content: prompt
//         }],
//         model: 'claude-3-5-sonnet-20241022',
//         max_tokens: 200,
//         system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
//     })
//     const answer = (response.content[0] as TextBlock).text; // react or node
//     if (answer == "react") {
//         res.json({
//             prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
//             uiPrompts: [reactBasePrompt]
//         })
//         return;
//     }
//     if (answer === "node") {
//         res.json({
//             prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
//             uiPrompts: [nodeBasePrompt]
//         })
//         return;
//     }
//     res.status(403).json({message: "You cant access this"})
//     return;
// })
// app.post("/chat", async (req, res) => {
//     const messages = req.body.messages;
//     const response = await anthropic.messages.create({
//         messages: messages,
//         model: 'claude-3-5-sonnet-20241022',
//         max_tokens: 8000,
//         system: getSystemPrompt()
//     })
//     console.log(response);
//     res.json({
//         response: (response.content[0] as TextBlock)?.text
//     });
// })
// NEW CODE
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("template hit");
    const prompt = req.body.prompt;
    const response = yield ollama.generate({
        model: basemodel,
        prompt: prompt,
        system: "Return either node or react based on what do you think this project should be. ONLY return a SINGLE word either 'node' or 'react'. Do not return anything extra such as justifications and so on",
    });
    const answer = response.response.trim().toLocaleLowerCase(); // react or node
    console.log("answer: " + answer);
    if (answer == "react") {
        console.log("react returning");
        res.json({
            prompts: [prompts_1.BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [react_1.basePrompt]
        });
        return;
    }
    if (answer === "node") {
        console.log("node returning");
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [node_1.basePrompt]
        });
        return;
    }
    res.status(403).json({ message: "You cant access this" });
    return;
}));
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = req.body.messages;
    const response = yield ollama.chat({
        model: "bolt",
        messages: messages,
        keep_alive: -1
    });
    console.log("Response: ", response);
    const returnresponse = response.message.content;
    console.log(returnresponse);
    res.json({
        response: returnresponse
    });
}));
app.listen(3000);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const models = (yield ollama.list()).models;
        var bolt = false;
        for (const model of models) {
            console.log(model.name);
            console.log(model.name == "bolt:latest");
            if (model.name == "bolt:latest") {
                bolt = true;
                console.log("Bolt is installed");
                break;
            }
        }
        if (bolt == false) {
            console.log("Bolt is not installed");
            yield ollama.create({
                model: "bolt",
                from: basemodel,
                system: (0, prompts_1.getSystemPrompt)(),
                parameters: {
                    "num_ctx": 8000,
                    // "repeat_penalty": 1.1,
                    // "microstat":0.1,
                    // "top_k": 20,
                    // "top_p": 0.55,
                    "temperature": 0.2,
                }
            }).then(() => {
                console.log("Bolt is installed");
            });
        }
    });
}
run();
// hello i want u to build an todo application that should be aesthetic and have all the features in it it should be fully working and best looking
