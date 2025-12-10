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

    // !results
if (message.content.startsWith("!results")) {
    const embed = new EmbedBuilder()
        .setColor("#0a1a2f")
        .setTitle("📊 Résultats Hebdomadaires — Semaine du 1 au 5 décembre")
        .setDescription(
`Voici les performances réalisées du **lundi 1 au vendredi 5 décembre**.

---

📉 **Récapitulatif global :**

💰 **Résultat final : –367.91 €**  
📅 **Période : 1 → 5 décembre**  
🏦 **Courtier : IC Markets**

---

📘 **Détails :**

• Total des gains : **+92.31 €**  
• Total des pertes : **–460.22 €**  
➡️ **Résultat final : –367.91 €**

---

🎯 **Statistiques avancées :**

🎯 Winrate : **58.33%**  
📉 Drawdown max : **–178.45 €**  
📊 Trades : **24** (**14 gagnants / 10 perdants**)

---

📝 **Remarque :**  
Les résultats ont été vérifiés manuellement depuis MT5.  
Un nouveau rapport est publié chaque fin de semaine.`
        )
        .setImage("attachment://results.png")
        .setFooter({
            text: "Rapport hebdomadaire",
            iconURL: "https://i.imgur.com/YlLrFJr.png"
        });

    message.channel.send({
        embeds: [embed],
        files: [{ attachment: "https://i.imgur.com/rWKTHdS.png", name: "results.png" }]
    });
}


    // !liens
if (message.content.startsWith("!liens")) {
    const embed = new EmbedBuilder()
        .setColor("#091222")
        .setTitle("🔗 Liens Utiles — Outils de Trading")
        .setDescription(
`📈 **TradingView**  
➡️ [Accéder à TradingView](https://www.tradingview.com/)

💹 **IC Markets**  
➡️ [Accéder à IC Markets](https://www.icmarkets.eu/en/)

🏦 **RaiseFX**  
➡️ [Plateforme RaiseFX](https://live.raisefx.com/)

🎓 **Formation Circle Trading**  
➡️ [Accéder à la formation](https://jade21.podia.com/circle-formations/buy)

🎨 **Ebook Trading de Yans**  
➡️ [Voir l'Ebook Canva](https://www.canva.com/design/DAF0nSGLpMQ/erourlJTvg7cIpypTkIbsA/view)`
        )
        .setFooter({ text: "Outils essentiels", iconURL: "https://i.imgur.com/YlLrFJr.png" })
        .setImage("attachment://banner.png");

    message.channel.send({
        embeds: [embed],
        files: [{ attachment: "https://i.imgur.com/ufiNP1t.png", name: "banner.png" }]
    });
}


    // !comptes
if (message.content.startsWith("!comptes")) {
    const embed = new EmbedBuilder()
        .setColor("#091222")
        .setTitle("🔐 Comptes de Trading — Accès & Informations")
        .setDescription(
`Voici les accès organisés de manière claire.

---

## 👤 **Paul**

### 🟦 RaiseFX
• **Login ID :** \`RAISEFX_PAUL_ID\`  
• **Password :** \`RAISEFX_PAUL_MDP\`  
• **Server :** \`RaiseGlobal-Live\`

### 🟩 IC Markets
• **Login ID :** \`ICM_PAUL_ID\`  
• **Password :** \`ICM_PAUL_MDP\`  
• **Server :** \`ICMarketsEU-MT5-5\`

---

## 👤 **Maël**

### 🟦 RaiseFX
• **Login ID :** \`RAISEFX_MAEL_ID\`  
• **Password :** \`RAISEFX_MAEL_MDP\`  
• **Server :** \`RaiseGlobal-Live\`

---

⚠️ **Sécurité :**  
Les identifiants sont à usage interne. Ne les partagez jamais publiquement.`
        )
        .setFooter({ text: "Accès privés", iconURL: "https://i.imgur.com/YlLrFJr.png" });

    message.channel.send({ embeds: [embed] });
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










