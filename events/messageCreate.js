const { Events } = require('discord.js');

module.exports = {
	name: "messageCreate",
	async execute(message) {
        if (message.author.bot) {
            return;
        }

        message.channel.send("test");

        if (message.content.includes("@here") || message.content.includes("@everyone") || message.type == "REPLY") {
            return;
        }

        if (message.mentions.has('887145930468495372')) {
            message.channel.send("Hello there!");
        }

	},
};