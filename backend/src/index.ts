require("dotenv").config();
import express from "express";
// import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
// import { ContentBlock, TextBlock } from "@anthropic-ai/sdk/resources";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import cors from "cors";
import { Ollama } from "ollama";

// const anthropic = new Anthropic();
const app = express();
app.use(cors())
app.use(express.json())
const ollama = new Ollama();
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
app.post("/template", async (req, res) => {
    console.log("template hit")
    const prompt = req.body.prompt;
    const response = await ollama.generate({
        model: basemodel,
        prompt: prompt,
        system: "Return either node or react based on what do you think this project should be. ONLY return a SINGLE word either 'node' or 'react'. Do not return anything extra such as justifications and so on",
    })
    const answer = response.response.trim().toLocaleLowerCase(); // react or node
    console.log("answer: "+answer);
    if (answer == "react") {
        console.log("react returning");
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    }
    if (answer === "node") {
        console.log("node returning");
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        })
        return;
    }
    res.status(403).json({message: "You cant access this"})
    return;
})

app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    const response = await ollama.chat({
        model: "bolt",
        messages: messages,
        keep_alive:-1
    })
    
    console.log("Response: ", response);
    const returnresponse = response.message.content
    console.log(returnresponse);
    res.json({
        response: returnresponse
    });
})





app.listen(3000);

async function run() {
    const models = (await ollama.list()).models;
    var bolt = false;
    for (const model of models) {
        console.log(model.name);
        console.log(model.name == "bolt:latest")
        if (model.name == "bolt:latest") {
            bolt = true;
            console.log("Bolt is installed");
            break;
        }
    }
    if (bolt == false) {
        console.log("Bolt is not installed");
        await ollama.create({
            model: "bolt",
            from: basemodel,
            system: getSystemPrompt(),
            parameters: {
                "num_ctx": 8000,
                // "repeat_penalty": 1.1,
                // "microstat":0.1,
                // "top_k": 20,
                // "top_p": 0.55,
                "temperature": 0.2,
            }
        }).then(()=> {
            console.log("Bolt is installed");
        })
    }
}

run()



// hello i want u to build an todo application that should be aesthetic and have all the features in it it should be fully working and best looking