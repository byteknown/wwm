// commands/ocr.js
import { SlashCommandBuilder } from "discord.js";
import Tesseract from "tesseract.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ocr")
    .setDescription("Extract martial skills and goose score from a WWM screenshot")
    .addAttachmentOption(opt =>
      opt.setName("image")
        .setDescription("Upload your build screenshot")
        .setRequired(true)
    ),

  async execute(interaction) {
    const image = interaction.options.getAttachment("image");

    if (!image.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "❌ Please upload a valid **image file**.",
        ephemeral: true
      });
    }

    await interaction.reply("🔍 Reading image… please wait.");

    try {
      // Run OCR
      const { data } = await Tesseract.recognize(image.url, "eng");
      const raw = data.text || "";
      const text = raw.replace(/\s+/g, " ").trim(); // Clean spacing

      // Pattern searches
      const martial1 = text.match(/Nameless Sword/i)?.[0] ?? null;
      const martial2 = text.match(/Strategic Sword/i)?.[0] ?? null;
      const gooseMatch = text.match(/(\d+\.\d+)\s*Goose/i);
      const gooseScore = gooseMatch ? gooseMatch[1] : null;

      // Build response message
      let output = `📝 **OCR Text Extracted:**\n\`\`\`${text}\`\`\``;

      output += `\n\n🔎 **Detected Values:**`;

      output += `\n• Martial 1: **${martial1 ?? "❌ Not detected"}**`;
      output += `\n• Martial 2: **${martial2 ?? "❌ Not detected"}**`;
      output += `\n• Goose Score: **${gooseScore ?? "❌ Not detected"}**`;

      return interaction.editReply(output);

    } catch (err) {
      console.error(err);
      return interaction.editReply("❌ OCR failed. Please try again with a clearer screenshot.");
    }
  }
};
