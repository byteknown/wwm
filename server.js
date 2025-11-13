// server.js
import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';

// Create client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Load commands
client.commands = new Collection();
const commandsPath = path.join('./commands.js'); // we'll import single file
const commands = await import(commandsPath);
for (const [name, command] of Object.entries(commands)) {
    client.commands.set(name, command);
}

// Event: bot ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event: message create
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return; // prefix

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command!');
    }
});

// Login
client.login(process.env.TOKEN);
