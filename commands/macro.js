const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const TRADER_ROLE = "1445547144353419376";

async function fetchEconomic() {
    const today = new Date().toISOString().split("T")[0];

    const url = `https://financialmodelingprep.com/api/v3/economic_calendar?from=${today}&to=${today}&apikey=demo`;

    try {
        const { data } = await axios.get(url);
        return data;
    } catch (err) {
        console.error("Erreur API:", err);
        return [];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("macro")
        .setDescription("Affiche le rapport économique du jour"),

    async execute(interaction, client) {
        await interaction.deferReply();

        const events = await fetchEconomic();

        if (!events.length)
            return interaction.editReply("Aucune donnée économique disponible aujourd’hui.");

        let text = "";

        for (const e of events) {
            text += `**${e.event}** — ${e.country}\n`;
            text += `🕒 ${e.date} | Importance : ${e.importance}\n`;
            text += `📌 Prévision : **${e.estimate}**\n\n`;
        }

        const embed = new EmbedBuilder()
            .setColor("#091222")
            .setTitle("📊 Rapport Économique — Prévisions du Jour")
            .setDescription(`<@&${TRADER_ROLE}> Voici les annonces :`)
            .addFields({ name: "Prévisions du jour", value: text })
            .setFooter({
                text: "Prévisions économiques",
                iconURL: "https://i.imgur.com/YlLrFJr.png"
            })
            .setImage("attachment://banner.png");

        await interaction.editReply({
            embeds: [embed],
            files: [{ attachment: "https://i.imgur.com/ufiNP1t.png", name: "banner.png" }]
        });
    }
};
