const { Events } = require('discord.js');
const { OpenAI } = require('../openai.js');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const openAI = new OpenAI(process.env.OPENAI_API_KEY);

var context;
try {
    context = fs.readFileSync('./context.txt', 'utf8');
} catch (err) {
    console.error(err);
    return;
}

var prompt = [{ role: "system", content: context}];
var responded = true;

module.exports = {
	name: "messageCreate",
	async execute(message) {
        if (message.author.bot) {
            return;
        }

        if (message.content.includes("@here") || message.content.includes("@everyone")) {
            return;
        }

        if (message.mentions.has(process.env.BOT_ID)) {

            if (responded == false) {
                message.reply("I'm still responding to the previous message");
                return;
            }

            responded = false;

            const topic = message.content.replace("<@" + process.env.BOT_ID + ">", "");
            const model = 'gpt-3.5-turbo';
            prompt[prompt.length] = {role: "user", content : message.author.displayName + ": " + topic};

            if (topic.length > 300) {
                message.channel.send("I'm not reading all that");
                return;
            }

            console.log("NEW REQUEST:");
            console.log(prompt);
            const start = Date.now();
            await openAI.generateText(prompt, model, 1000)
                .then(text => {
                    const end = Date.now();
                    console.log("RESPONSE:");
                    console.log(text);
                    console.log("Response time: " + (end - start) / 1000 + "s");
                    message.reply(text);
                    prompt[prompt.length] = {role: "assistant", content: text};
                    responded = true;
                    while (prompt.length > 7) {
                        prompt.splice(1, 2);
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        }

	},
};