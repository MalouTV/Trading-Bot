require("dotenv").config();

const { loadSlashCommands } = require("./handlers/commands");

const axios = require("axios");
const schedule = require("node-schedule");
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require("discord.js");

// CONFIG
const ECON_CHANNEL = "1446225752994353343";
const TRADER_ROLE = "1445547144353419376";

// ------------------------ CLIENT ------------------------

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ------------------------ READY (FUSIONNÉ) ------------------------

client.once("ready", () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);

    // IMPORTANT : on initialise la Map des slash commands
    client.slashCommands = new Map();

    // Charge les slash commands du dossier ./commands
    loadSlashCommands(client);

    // Rapport du matin à 8h30
    schedule.scheduleJob("30 8 * * *", () => sendMorningReport(client));

    // Surveillance live toutes les 60 secondes
    setInterval(() => liveEconomicWatcher(client), 60 * 1000);
});

// ------------------------ COMMANDES TEXTUELLES ------------------------

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // !attente
    if (message.content.startsWith("!attente")) {
        const embed = new EmbedBuilder()
            .setColor("#091222")
            .setTitle("📊 Serveur de Trade — Accès Restreint")
            .setDescription(
`Bienvenue sur le **serveur privé de trading** de <@887008564240056350> et <@641643688967012363>.

Pour obtenir l'accès complet, contactez :
👤 <@887008564240056350>  
👤 <@641643688967012363>

Merci de patienter ici en attendant la validation.`)
            .setFooter({ text: "Vérification obligatoire", iconURL: "https://i.imgur.com/YlLrFJr.png" })
            .setImage("attachment://banner.png");

        message.channel.send({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/9vQskFX.png", name: "banner.png" }]
        });
    }

    // !liens
    if (message.content.startsWith("!liens")) {
        const embed = new EmbedBuilder()
            .setColor("#091222")
            .setTitle("🔗 Liens Utiles — Outils de Trading")
            .setDescription(
`📈 TradingView  
➡️ https://www.tradingview.com/

💹 IC Markets Webtrader  
➡️ https://www.icmarkets.eu/en/

📰 Investing.com  
➡️ https://www.investing.com/`)
            .setFooter({ text: "Outils essentiels", iconURL: "https://i.imgur.com/YlLrFJr.png" })
            .setImage("attachment://banner.png");

        message.channel.send({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/ufiNP1t.png", name: "banner.png" }]
        });
    }

    // !associes
    if (message.content.startsWith("!associes")) {
        const embed = new EmbedBuilder()
            .setColor("#091222")
            .setTitle("🤝 Associés du Projet — Participation Financière")
            .setDescription(
`Voici la liste des **associés ayant investi financièrement** au projet. <@&1445756907871666236>

---

💼 **Séverin**  
Contribution : **250 €**

💼 **Marc**  
Contribution : **300 €**

---`)
            .setFooter({ text: "Associés officiels du projet", iconURL: "https://i.imgur.com/YlLrFJr.png" })
            .setImage("attachment://banner.png");

        message.channel.send({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/av6BBoj.png", name: "banner.png" }]
        });
    }

    // !resultats
    if (message.content.startsWith("!resultats")) {
        const embed = new EmbedBuilder()
            .setColor("#091222")
            .setTitle("📈 Résultats Hebdomadaires — 24 → 28")
            .setDescription(
`Profit : **+32.53 €**  
Winrate : **66.67%**  
Drawdown max : **-3.16 €**`)
            .setFooter({ text: "Rapport hebdomadaire", iconURL: "https://i.imgur.com/YlLrFJr.png" })
            .setImage("attachment://banner.png");

        message.channel.send({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/rWKTHdS.png", name: "banner.png" }]
        });
    }
});

// ------------------------ INTERACTIONS (SLASH COMMANDS) ------------------------

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        interaction.reply({
            content: "Une erreur est survenue.",
            ephemeral: true
        });
    }
});

// ------------------------ LOGIN ------------------------

client.login(process.env.TOKEN);
