const { Events } = require('discord.js');
const { OpenAI } = require('../openai.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const dotenv = require('dotenv');
const speechSynth = require('../SpeechSynthesis.js');
const fs = require('fs');
dotenv.config();

const openAI = new OpenAI(process.env.OPENAI_API_KEY);
const maxMessageMemory = 9; // max # messages saved and sent in completion request including context string but not including most recent prompt
const maxCharPrompt = 300;
const tts = false;
const reply = true;

var context;
try {
    context = fs.readFileSync('./context.txt', 'utf8');
} catch (err) {
    console.error(err);
    return;
}

var promptList = [{ role: "system", content: context}];
var responded = true;

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        if (message.author.bot) {
            return;
        }

        if (message.content.includes("@here") || message.content.includes("@everyone")) {
            return;
        }

        if (message.mentions.has(process.env.BOT_ID)) {

            // don't allow a completion request if one is already being handled
            if (responded == false) {
                message.reply("Patience. I am still responding to the previous message.");
                return;
            }
            responded = false;

            const prompt = message.content.replace("<@" + process.env.BOT_ID + ">", ""); // remove the bot's id from prompt
            const model = 'gpt-3.5-turbo';
            promptList[promptList.length] = {role: "user", content : message.author.displayName + ": " + prompt}; // add new prompt to end of list

            // limits the size of message to add to prompList
            if (prompt.length > maxCharPrompt) {
                message.channel.send("I'm not reading all that");
                return;
            }

            console.log("NEW REQUEST:");
            console.log(promptList);
            const start = Date.now();
            await openAI.generateText(promptList, model, 400) // request chat completion
                .then(text => {
                    const end = Date.now();
                    console.log("RESPONSE:");
                    console.log(text);
                    console.log("Response time: " + (end - start) / 1000 + "s"); // log the time between completion request and response
                    if (reply) {
                        message.reply(text);
                    }
                    if (message.member.voice.channel && tts) {
                        speechSynth(text).then(result => {
                            const connection = joinVoiceChannel({
                                channelId: message.member.voice.channelId,
                                guildId: message.guildId,
                                adapterCreator: message.guild.voiceAdapterCreator,
                                selfDeaf: false
                            });
                            const player = createAudioPlayer();
                            const resource = createAudioResource('./audio/speech.wav');
                            const subscription = connection.subscribe(player);
                            player.play(resource);
                        });
                    }
                    promptList[promptList.length] = {role: "assistant", content: text}; // add completion to end of list
                    responded = true;

                    // remove prompts after the context prompt from front of list until 7 or less remain
                    while (promptList.length > maxMessageMemory) {
                        promptList.splice(1, 2);
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        }

	},
};