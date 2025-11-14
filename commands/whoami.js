import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { SlashCommandBuilder } from "discord.js";

const sqlite = sqlite3.verbose();

export default {
  data: new SlashCommandBuilder()
    .setName("yo")
    .setDescription("Comprueba tus datos"),

  async execute(interaction) {
    const discordId = interaction.user.id;

    // Open DB
    const db = await open({
      filename: "./database/users.sqlite",
      driver: sqlite.Database
    });

    const row = await db.get(
      "SELECT ingame_name FROM users WHERE discord_id = ?",
      discordId
    );

    if (!row) {
      return interaction.reply({
        content: "❌ Aún no te has registrado. Usa /registro <nombre>.",
        flags: 64
      });
    }

    await interaction.reply({
      content: `✅ Tu nombre en el juego es **${row.ingame_name}**.`,
      flags: 64
    });
  }
};
