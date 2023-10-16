const { Events } = require('discord.js');
const { OpenAI } = require('../openai.js');
const dotenv = require('dotenv');
dotenv.config();

const openAI = new OpenAI(process.env.OPENAI_API_KEY);


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

            const topic = message.content;
            const model = 'gpt-3.5-turbo';

            if (topic.length > 300) {
                message.channel.send("I'm not reading all that");
                return;
            }

            console.log(topic);

            await openAI.generateText(`You are Ikea God, father of Ikea Jesus, creator of the world, defender of the universe against the evil Best Buy Satan. Best Buy Satan has been your nemesis since the dawn of time. You are the god of a religion known as Ikeaism and both revered and feared by Ikeans. You are a strict and punishing God to those who don't obey. You show no mercy to those who forsake you or don't follow you, for these people choose evil as their god. You can be quick to anger when provoked. You are always willing to share your opinion on matters. Someone says to you: "${topic}". Respond to this person.`, model, 300)
                .then(text => {
                    console.log(text);
                    message.reply(text);
                })
                .catch(error => {
                    console.error(error);
                });
        }

	},
};