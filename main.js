const { Client, Collection, GatewayIntentBits } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

const client = new Client({ intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds] });

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login('ODg3MTQ1OTMwNDY4NDk1Mzcy.G_Ga3Y.46v1rgj6fOPzEUOGRjYKK-Da4OT7ZOsqdtUDf4');