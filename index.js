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

    // !cours1
if (message.content.startsWith("!cours1")) {
    const embed = new EmbedBuilder()
        .setColor("#091222")
        .setTitle("📘 Cours 1 — Bases du Trading (Forex & Indices)")
        .setDescription("Voici le cours complet, organisé en sections avec les images Imgur correspondantes.")
        .addFields(
            {
                name: "🔹 1. Le Forex : Définition & Fonctionnement",
                value:
`Le Forex (Foreign Exchange) est le marché où s’échangent les devises. C’est le marché le plus liquide au monde, ouvert 24h/24 – 5j/7.

Tu spécules sur la hausse ou la baisse d’une devise contre une autre (ex : EUR/USD).

**Buy / Long** → tu paries que la première devise monte.  
**Sell / Short** → tu paries qu’elle baisse.

👉 Tu trades toujours une devise *contre une autre*.

📸 **Exemple Buy/Sell :**  
https://i.imgur.com/IMAGE_BUYSELL.png`,
            },
            {
                name: "🔹 2. Le Spread",
                value:
`Le spread = différence entre le prix réel du marché et le prix proposé par le broker.

→ C’est un **coût caché** indispensable.  
→ Spread faible = forte liquidité.  
→ Les indices (US30, US100) ont souvent un spread plus élevé.

📸 **Exemple Spread Bid/Ask :**  
https://i.imgur.com/IMAGE_SPREAD.png`
            },
            {
                name: "🔹 3. Deux types d’analyses",
                value:
`**Analyse fondamentale :**  
Étudie les news économiques, politiques, décisions des banques centrales.  
Impact par devise :  
• USD → Fed  
• EUR → BCE  
• JPY → BoJ  
• GBP → Bank of England

**Analyse technique :**  
Étude du graphique, des structures, patterns, supports, résistances.  
🎯 Objectif : construire des scénarios probables.

📸 **Exemple analyse technique :**  
https://i.imgur.com/IMAGE_AT.png`
            },
            {
                name: "🔹 4. Le Pip",
                value:
`Le pip = Point in Percentage.  
C’est la plus petite variation standardisée d’un prix Forex.

Exemple : 1.0850 → 1.0851 = **1 pip**

Il sert à calculer :  
• Stop loss  
• Take profit  
• Taille de lot

C’est la base du money management.

📸 **Exemple calcul pip :**  
https://i.imgur.com/IMAGE_PIP.png`
            },
            {
                name: "🔹 5. Effet de levier",
                value:
`Le levier permet de contrôler une position plus grande que son capital.

Ex : 100 € avec levier 1:100 → tu contrôles 10 000 €.

⚠️ Amplifie les gains mais aussi les pertes.`
            },
            {
                name: "🔹 6. Différents actifs",
                value:
`**Actions :** part de propriété d’une entreprise.  
**Obligations :** prêt rémunéré à un État ou une entreprise.  
**Forex :** marché des devises, extrêmement liquide.  
**Indices :** regroupement de grandes entreprises →  
• US30 (Dow Jones)  
• US100 (Nasdaq 100)  
• SPX (S&P 500)

**Crypto :** actifs numériques sur blockchain.

📸 **Présentation indices US :**  
https://i.imgur.com/IMAGE_INDICES.png`
            },
            {
                name: "🔹 7. Les sessions de Trading",
                value:
`**Sydney (22h–7h)** → faible volatilité, AUD/NZD.  
**Tokyo (23h–7h)** → JPY très volatile (forte réaction aux décisions BoJ).  

📸 **Paires JPY très volatiles :**  
https://i.imgur.com/IMAGE_JPY.png

**Londres (7h–16h)** → session la plus active du monde.  
Pairs les plus touchées : EUR, GBP, CHF.

**New York (12h–20h)** → impact énorme sur USD & indices US.

**Overlaps (chevauchements) :**  
• Londres + New York → 14h–17h : énorme volatilité  
• Sydney + Tokyo → volatilité AUD/NZD/JPY

📸 **Schéma sessions mondiales :**  
https://i.imgur.com/IMAGE_SESSIONS.png`
            },
            {
                name: "🔹 8. Les Tendances",
                value:
`**Tendance haussière (Bullish)** → sommets + creux de plus en plus hauts  
**Tendance baissière (Bearish)** → sommets + creux de plus en plus bas  
**Range** → prix oscillant entre support et résistance

📸 **Exemple Uptrend / Downtrend / Range :**  
https://i.imgur.com/IMAGE_TRENDS.png`
            },
            {
                name: "🔹 9. Patterns Chartistes",
                value:
`Voici les patterns les plus utilisés :

1️⃣ Épaule–Tête–Épaule (E.T.E) → baissier  
https://i.imgur.com/AEmFADv.png
2️⃣ Inversé → haussier  
https://i.imgur.com/T2CkyDO.png
3️⃣ Double sommet → baissier  
https://i.imgur.com/gWmELgK.png
4️⃣ Double creux → haussier 
https://i.imgur.com/JDzlw1j.png
5️⃣ Triangle ascendant → haussier  
https://i.imgur.com/A4iu9b0.png
6️⃣ Triangle descendant → baissier  
https://i.imgur.com/SjpMdYi.png


            },
            {
                name: "🔹 10. Zones de prix (Support / Résistance)",
                value:
`Ce sont les zones où le prix réagit fortement.

Un prix peut :  
• rebondir (réaction)  
• casser (breakout)  
• faire un faux breakout (piège)

📸 **Exemple Support / Résistance :**  
https://i.imgur.com/IMAGE_SR.png`
            }
        )
        .setFooter({ text: "Formation Trading — Chapitre 1", iconURL: "https://i.imgur.com/YlLrFJr.png" })
        .setImage("attachment://banner_cours1.png");

    message.channel.send({
        embeds: [embed],
        files: [{ attachment: "https://i.imgur.com/9vQskFX.png", name: "banner_cours1.png" }]
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

    🔗 **Commandes textuelles améliorées**
    • \`!liens\` : Accès rapide à TradingView, IC Markets, Investing  
    • \`!attente\` : Support visuel pour l’accueil des traders

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





