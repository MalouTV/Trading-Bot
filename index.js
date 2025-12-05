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

// ------------------------ READY ------------------------

client.once("ready", () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);

    client.slashCommands = new Map();
    loadSlashCommands(client);

    // Rapport du matin
    schedule.scheduleJob("30 8 * * *", () => sendMorningReport(client));

    // Surveillance live
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
`Bienvenue sur le serveur privé de trading.

Contactez :
<@887008564240056350>
<@641643688967012363>`)
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

💹 IC Markets  
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

    

    // !devblogs
    if (message.content.startsWith("!devblogs")) {

        const embed = new EmbedBuilder()
            .setColor("#091222")
            .setTitle("🛠️ DevBlogs — Trading Bot v1.0")
            .setDescription(
    `Voici les nouveautés de la **version 1.0** du bot de trading.

    🚀 **Rapport économique automatique**
    • Envoi d’un rapport chaque matin à 8h30  
    • Affichage détaillé : pays, importance, prévisions, impacts

    📡 **Surveillance économique en temps réel**
    • Scan des annonces toutes les minutes  
    • Détection automatique des nouvelles données publiées  
    • Affichage instantané des résultats + impact GOLD  
    • Anti-spam intégré grâce au système de détection d’ID

    📊 **Analyse d’impact GOLD**
    • Détection intelligente pour CPI, inflation, payrolls  
    • Analyse automatique positive / négative pour l’or

    ⚙️ **Améliorations techniques**
    • Intégration complète des slash commands  
    • Optimisation du chargement des handlers  
    • Refonte des requêtes API + gestion des erreurs  
    • Système de cache pour éviter les doublons d’annonces

    La v1.0 marque le début du bot d'analyse macro-éco automatisée, pensé pour les traders actifs.`)
            .setFooter({ text: "DevBlogs — Version 1.0", iconURL: "https://i.imgur.com/YlLrFJr.png" })
            .setImage("attachment://banner.png");

        message.channel.send({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/GDtpiR6.png", name: "banner.png" }]
        });
    }

});

// ------------------------ ÉCONOMIE : FONCTIONS MANQUANTES (FIX) ------------------------

function goldImpact(event) {
    if (!event.actual || !event.estimate) {
        return "🟡 En attente des données";
    }
    const diff = event.actual - event.estimate;
    const name = event.event.toLowerCase();

    if (name.includes("cpi") || name.includes("inflation"))
        return diff < 0 ? "🟢 Positive pour l’or" : "🔴 Négative pour l’or";

    if (name.includes("payroll") || name.includes("employment"))
        return diff < 0 ? "🟢 Positive (emploi faible)" : "🔴 Négative (emploi solide)";

    return diff < 0 ? "🟢 Plutôt favorable" : "🔴 Plutôt défavorable";
}

async function fetchEconomic(todayOnly = false) {
    const today = new Date().toISOString().split("T")[0];

    const url = todayOnly
        ? `https://financialmodelingprep.com/api/v3/economic_calendar?from=${today}&to=${today}&apikey=demo`
        : `https://financialmodelingprep.com/api/v3/economic_calendar?apikey=demo`;

    try {
        const { data } = await axios.get(url);
        return data;
    } catch (err) {
        console.error("Erreur API :", err);
        return [];
    }
}

async function sendMorningReport(client) {
    const events = await fetchEconomic(true);
    const channel = client.channels.cache.get(ECON_CHANNEL);

    if (!events.length) return;

    let text = "";
    for (const e of events) {
        text += `**${e.event}** — ${e.country}\n`;
        text += `🕒 ${e.date} | Importance : ${e.importance}\n`;
        text += `📌 Prévision : **${e.estimate}**\n\n`;
    }

    const embed = new EmbedBuilder()
        .setColor("#091222")
        .setTitle("📊 Rapport Économique — Prévisions du Jour")
        .setDescription(`<@&${TRADER_ROLE}> Voici les annonces macroéconomiques :`)
        .addFields({ name: "Prévisions du Jour", value: text })
        .setFooter({ text: "Prévisions économiques", iconURL: "https://i.imgur.com/YlLrFJr.png" })
        .setImage("attachment://banner.png");

    channel.send({
        embeds: [embed],
        files: [{ attachment: "https://i.imgur.com/PSwSrTU.png", name: "banner.png" }]
    });
}

let lastSent = new Set();

async function liveEconomicWatcher(client) {
    const events = await fetchEconomic();
    const channel = client.channels.cache.get(ECON_CHANNEL);

    for (const e of events) {
        if (!e.actual) continue;
        const id = e.date + e.event;
        if (lastSent.has(id)) continue;

        lastSent.add(id);

        const embed = new EmbedBuilder()
            .setColor("#091222")
            .setTitle(`📢 Nouvelle Annonce — ${e.event}`)
            .setDescription(`<@&${TRADER_ROLE}> Donnée officielle :`)
            .addFields(
                { name: "Pays", value: e.country, inline: true },
                { name: "Importance", value: e.importance, inline: true },
                { name: "Prévision", value: `${e.estimate}`, inline: true },
                { name: "Publié", value: `${e.actual}`, inline: true },
                { name: "Impact GOLD", value: goldImpact(e) }
            )
            .setFooter({ text: "Données officielles", iconURL: "https://i.imgur.com/YlLrFJr.png" })
            .setImage("attachment://banner.png");

        channel.send({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/PSwSrTU.png", name: "banner.png" }]
        });
    }
}

// ------------------------ SLASH COMMANDS ------------------------

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
    }
});


// ------------------------ LOGIN ------------------------

client.login(process.env.TOKEN);

