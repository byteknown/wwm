// commands/ocr.js
import { SlashCommandBuilder } from "discord.js";
import Tesseract from "tesseract.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ocr")
    .setDescription("Extract martial skills and goose score from WWM screenshot")
    .addAttachmentOption(opt =>
      opt.setName("image")
        .setDescription("Upload your screenshot")
        .setRequired(true)
    ),

  async execute(interaction) {
    const image = interaction.options.getAttachment("image");

    if (!image.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "❌ Upload a valid image file.",
        ephemeral: true
      });
    }

    await interaction.reply("🔍 Reading image…");

    try {
      const result = await Tesseract.recognize(image.url, "eng", {
        workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js/dist/worker.min.js",
        langPath: "https://tessdata.projectnaptha.com/4.0.0",
        corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@2.2.0/tesseract-core.wasm.js",
      });

      const text = result.data.text.replace(/\s+/g, " ").trim();

      // Extract values
      const martial1 = text.match(/Nameless Sword/i)?.[0] ?? null;
      const martial2 = text.match(/Strategic Sword/i)?.[0] ?? null;
      const gooseScore = text.match(/(\d+\.\d+)\s*Goose/i)?.[1] ?? null;

      let msg = `📝 **OCR text:**\n\`\`\`${text}\`\`\``;
      msg += `\n\n🔎 Detected:`;
      msg += `\n• Nameless Sword: **${martial1 ?? "❌"}**`;
      msg += `\n• Strategic Sword: **${martial2 ?? "❌"}**`;
      msg += `\n• Goose Score: **${gooseScore ?? "❌"}**`;

      return interaction.editReply(msg);

    } catch (err) {
      console.error(err);
      return interaction.editReply("❌ OCR failed.");
    }
  }
};
