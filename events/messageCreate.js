const { Events } = require('discord.js');
const { OpenAI } = require('../openai.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const dotenv = require('dotenv');
const speechSynth = require('../SpeechSynthesis.js');
const fs = require('fs');

const openAI = new OpenAI(process.env.OPENAI_API_KEY);
const maxMessageMemory = 9; // max # messages saved and sent in completion request including context string but not including most recent prompt
const maxCharPrompt = 800;
const tts = true;
const reply = true;
const botReplyDelay = 20000;
const botResponsePercent = 0.75;
const model = 'gpt-4-1106-preview';

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

        if (message.content.includes("@here") || message.content.includes("@everyone")) {
            return;
        }

        const prompt = message.content.replace("<@" + process.env.BOT_ID + ">", "Ikea God"); // remove the bot's id from prompt

        if (message.author.bot) {
            if (message.author.id == process.env.BEST_BUY_ID) {
                if (!message.mentions.has(process.env.BOT_ID)) {
                    promptList[promptList.length] = {role: "user", content: message.author.displayName + ": " + prompt}; // add Best Buy Satan's message to the prompt list
                }
                // random chance to not respond to Best Buy Satan
                if (Math.random() > botResponsePercent) {
                    return;
                }
            } else {
                return;
            }
        }

        

        if (message.mentions.has(process.env.BOT_ID)) {

            if (message.author.bot && !(message.content.includes("I'm not reading all that")) && (message.member.voice.channel && tts)) {
                console.log("wait " + botReplyDelay + "ms");
                await sleep(botReplyDelay)
                function sleep(ms) {
                return new Promise((resolve) => {
                    setTimeout(resolve, ms);
                });
                }
            }

            // don't allow a completion request if one is already being handled
            if (responded == false) {
                message.reply("Patience. I am still responding to the previous message.");
                if (message.member.voice.channel && tts) {
                    speechSynth("Patience. I am still responding to the previous message.").then(result => {
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
                return;
            }
            responded = false;

            promptList[promptList.length] = {role: "user", content: message.author.displayName + ": " + prompt}; // add new prompt to end of list

            // limits the size of message to add to prompList
            if (prompt.length > maxCharPrompt) {
                message.reply("I'm not reading all that");
                if (message.member.voice.channel && tts) {
                    speechSynth("I'm not reading all that").then(result => {
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
                responded = true;
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
                        var discordResponse = text.replace("Best Buy Satan", "<@" + process.env.BEST_BUY_ID + ">");
                        if (message.author.bot) {
                            message.channel.send(discordResponse);
                        } else {
                            message.reply(discordResponse);
                        }
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