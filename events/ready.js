const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const commands = [];
    const commandsPath = path.join(__dirname, '..', 'commands');

    function load(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.lstatSync(full).isDirectory()) load(full);
        else if (file.endsWith('.js')) {
          const command = require(full);
          if (command.data) commands.push(command.data.toJSON());
        }
      }
    }
    load(commandsPath);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      console.log(`🚀 Registering ${commands.length} slash commands...`);

      if (process.env.GUILD_ID) {
        await rest.put(
          Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.GUILD_ID),
          { body: commands }
        );
        console.log(`✅ Commands registered to guild ${process.env.GUILD_ID}`);
      } else {
        await rest.put(
          Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
          { body: commands }
        );
        console.log(`✅ Global commands registered`);
      }

    } catch (error) {
      console.error('❌ Failed to register commands:', error);
    }
  },
};
