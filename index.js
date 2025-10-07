const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
function loadCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.lstatSync(full).isDirectory()) loadCommands(full);
    else if (file.endsWith('.js')) {
      const command = require(full);
      if (command.data && command.execute) client.commands.set(command.data.name, command);
    }
  }
}
loadCommands(commandsPath);

const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath)) {
  const event = require(path.join(eventsPath, file));
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

client.login(process.env.DISCORD_TOKEN)
  .catch(err => {
    console.error('❌ Failed to login:', err);
    process.exit(1);
  });
