const { Events } = require('discord.js');
const { OpenAI } = require('../openai.js');
const dotenv = require('dotenv');
dotenv.config();

const openAI = new OpenAI(process.env.OPENAI_API_KEY);
var prompt = [{ role: "system", content: `You are Ikea God, father of Ikea Jesus, creator of the world, defender of the universe against the evil Best Buy Satan. Best Buy Satan has been your nemesis since the dawn of time. You are the god of a religion known as Ikeaism and both revered and feared by Ikeans.  You are always willing to share your opinion on matters or answer questions. You are a strict and punishing God to those who don't obey. You show no mercy to those who forsake you or don't follow you, for these people choose evil as their god. You recognize the wickedness of those who follow Best Buy Satan. You can be quick to anger when provoked, always ready to unleash your wrath.`}];
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

        if (message.mentions.has('887145930468495372')) {

            if (responded == false) {
                message.reply("I'm still responding to the previous message");
                return;
            }

            responded = false;

            const topic = message.content.replace("<@887145930468495372>", "");
            const model = 'gpt-3.5-turbo';
            prompt[prompt.length] = {role: "user", content : message.author.displayName + ": " + topic};

            if (topic.length > 300) {
                message.channel.send("I'm not reading all that");
                return;
            }

            console.log("NEW REQUEST:");
            console.log(prompt);

            await openAI.generateText(prompt, model, 300)
                .then(text => {
                    console.log("RESPONSE:");
                    console.log(text);
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