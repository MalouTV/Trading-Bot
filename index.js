require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

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

Merci de patienter ici en attendant la validation.`
            )
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
➡️ https://www.investing.com/`
            )
            .setFooter({ text: "Outils essentiels", iconURL: "https://i.imgur.com/YlLrFJr.png" })
            .setImage("attachment://banner.png");

        message.channel.send({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/ufiNP1t.png", name: "banner.png" }]
        });
    }

    // ---------------- !associes ----------------

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith("!associes")) return;
    if (message.author.bot) return;

    const bannerUrl = "https://i.imgur.com/av6BBoj.png"; // ta bannière ASSOCIÉS
    const smallIcon = "https://i.imgur.com/YlLrFJr.png"; // icône footer

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
        .setFooter({ 
            text: "Associés officiels du projet",
            iconURL: smallIcon
        })
        .setImage("attachment://banner.png") // bannière en bas
        .setTimestamp();

    message.channel.send({
        embeds: [embed],
        files: [
            { attachment: bannerUrl, name: "banner.png" }
        ]
    });
});


    // ---------------- !resultats ----------------
    if (message.content.startsWith("!resultats")) {

        const embed = new EmbedBuilder()
            .setColor("#091222")
            .setTitle("📈 Résultats Hebdomadaires — 24 → 28")
            .setDescription(
`Profit : **+32.53 €**
Winrate : **66.67%**
Drawdown max : **-3.16 €**`
            )
            .setFooter({ text: "Rapport hebdomadaire", iconURL: "https://i.imgur.com/YlLrFJr.png" })
            .setImage("attachment://banner.png");

        message.channel.send({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/rWKTHdS.png", name: "banner.png" }]
        });
    }
});

// ------------------------ LOGIN ------------------------

client.login(process.env.TOKEN);
