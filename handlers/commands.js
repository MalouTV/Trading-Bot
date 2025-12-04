const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

async function loadSlashCommands(client) {
    client.slashCommands = new Map();

    const commandsPath = path.join(__dirname, "..", "commands");
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

    const commandsJSON = [];

    for (const file of files) {
        const cmd = require(path.join(commandsPath, file));
        client.slashCommands.set(cmd.data.name, cmd);
        commandsJSON.push(cmd.data.toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commandsJSON }
    );

    console.log(`✓ ${client.slashCommands.size} slash commands enregistrées`);
}

module.exports = { loadSlashCommands };
