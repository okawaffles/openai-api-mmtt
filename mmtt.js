require('dotenv').config(); // load environment vars
const { appendFileSync, writeFileSync } = require('fs');
const { Logger } = require('okayulogger');
const OpenAI = require("openai");
const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const oai = new OpenAI();
const L = new Logger('mmtt');
L.warn("Using this program may incur charges on your OpenAI account. I am not responsible for these charges.");

const models = [
    'gpt-4-turbo',
    'gpt-4-1106-preview',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-1106',
    'gpt-3.5-turbo-16k',    
]

// user prefs
let USelectedModel = "none";
let UPrompt = "";

// list off the models that the user can select
function selectModel() {
    let i = 0;
    L.info("Select a model:");
    models.forEach(model => {
        console.log(`${i} : ${model}`);
        i++;
    });

    readline.question("Select a model: ", modelNum => {
        try {
            USelectedModel = model[modelNum];
        } catch (error) {
            L.error(`Failed to select model with index ${modelNum}`);
            process.exit();
        }
        readline.close();
    });
}

// get response from OpenAI
async function runCompletion() {
    const completion = await oai.chat.completions.create({
        messages:[
            {"role":"user", "content":UPrompt.toString()}
        ],
        model: USelectedModel.toString()
    });

    L.info(`Response from model (${USelectedModel}): ${completion.choices[0]}`);
    appendFileSync("responses.txt", `(M='${USelectedModel}' P='${UPrompt}')`);
}

async function main() {
    if (USelectedModel == "none") selectModel();

    L.info("0 : Get Completion");
    L.info("1 : Change Prompt");
    L.info("2 : Change Model");
    
    readline.question("Select option: ", sel => {
        switch(sel) {
            case "0":
                await runCompletion();
                break;
            case "1":
                readline.question("Set prompt to: ", p => {
                    UPrompt = p;
                    readline.close();
                });
                break;
            case "2":
                selectModel();
                break;
            default:
                L.error("Bad selection, exiting ...");
                process.exit();
                break;
        }
        
        readline.close();
    });
}

writeFileSync("responses.txt", "-- Responses from last session --\n", 'utf-8');
main();