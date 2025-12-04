require("dotenv").config();

const axios = require("axios");
const schedule = require("node-schedule");
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
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

client.once("ready", () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
});

// ------------------------ COMMANDES TEXTUELLES ------------------------

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // ---------------- !attente ----------------
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

    // ---------------- !liens ----------------
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

    // ---------------- !associes ----------------
    if (message.content.startsWith("!associes")) {

        const bannerUrl = "https://i.imgur.com/av6BBoj.png"; 
        const smallIcon = "https://i.imgur.com/YlLrFJr.png";

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

---

Ces apports permettent de développer le serveur, les outils et l’ensemble de l’infrastructure liée au trading.  
Merci à eux pour leur investissement et leur confiance.`)
            .setFooter({ text: "Associés officiels du projet", iconURL: smallIcon })
            .setImage("attachment://banner.png")
            .setTimestamp();

        message.channel.send({
            embeds: [embed],
            files: [{ attachment: bannerUrl, name: "banner.png" }]
        });
    }

    // ---------------- !resultats ----------------
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

// ------------------------ Analyse GOLD ------------------------

function goldImpact(event) {
    if (!event.actual || !event.estimate) {
        return "🟡 En attente des données (impact à confirmer)";
    }

    const diff = event.actual - event.estimate;
    const name = event.event.toLowerCase();

    if (name.includes("cpi") || name.includes("inflation")) {
        return diff < 0 ? "🟢 Positive pour l'or (inflation plus faible)" 
                        : "🔴 Négative pour l'or (inflation élevée)";
    }

    if (name.includes("payroll") || name.includes("employment") || name.includes("job")) {
        return diff < 0 ? "🟢 Positive pour l'or (emploi faible)" 
                        : "🔴 Négative pour l'or (emploi solide)";
    }

    return diff < 0 ? "🟢 Plutôt favorable" : "🔴 Plutôt défavorable";
}

// ------------------------ Fetch API ------------------------

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

// ------------------------ Rapport du matin ------------------------

async function sendMorningReport(client) {
    const events = await fetchEconomic(true);
    const channel = client.channels.cache.get(ECON_CHANNEL);

    if (!events.length) return;

    const embed = new EmbedBuilder()
        .setColor("#091222")
        .setTitle("📊 Rapport Économique — Prévisions du Jour")
        .setDescription(`<@&${TRADER_ROLE}> Voici les annonces macroéconomiques prévues aujourd’hui :`)
        .setFooter({ text: "Prévisions économiques", iconURL: "https://i.imgur.com/YlLrFJr.png" })
        .setImage("attachment://banner.png");

    let text = "";

    for (const e of events) {
        text += `**${e.event}** — ${e.country}\n`;
        text += `🕒 ${e.date} | Importance : ${e.importance}\n`;
        text += `📌 Prévision : **${e.estimate}**\n\n`;
    }

    embed.addFields({ name: "Prévisions", value: text });

    channel.send({
        embeds: [embed],
        files: [{ attachment: "https://i.imgur.com/ufiNP1t.png", name: "banner.png" }]
    });
}

// ------------------------ Rapport LIVE ------------------------

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
            .setDescription(`<@&${TRADER_ROLE}> Voici la donnée officielle :`)
            .addFields(
                { name: "Pays", value: e.country, inline: true },
                { name: "Importance", value: e.importance, inline: true },
                { name: "Prévision", value: `${e.estimate}`, inline: true },
                { name: "Publié", value: `${e.actual}`, inline: true },
                { name: "Impact GOLD", value: goldImpact(e), inline: false }
            )
            .setFooter({ text: "Données officielles", iconURL: "https://i.imgur.com/YlLrFJr.png" })
            .setImage("attachment://banner.png");

        channel.send({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/9vQskFX.png", name: "banner.png" }]
        });
    }
}

// ------------------------ Automatisation ------------------------

client.on("ready", () => {
    console.log(`Bot connecté : ${client.user.tag}`);

    // Rapport du matin à 8h30
    schedule.scheduleJob("30 8 * * *", () => sendMorningReport(client));

    // Surveillance live toutes les 60 secondes
    setInterval(() => liveEconomicWatcher(client), 60 * 1000);
});

// ------------------------ LOGIN ------------------------

client.login(process.env.TOKEN);
