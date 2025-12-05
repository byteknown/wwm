import { SlashCommandBuilder } from "discord.js";
import Tesseract from "tesseract.js"; 
import path from "path";

// Create a worker promise
let workerPromise = Tesseract.createWorker({
  workerPath: path.resolve("./node_modules/tesseract.js/dist/worker.min.js"),
  corePath: path.resolve("./node_modules/tesseract.js/dist/tesseract-core.wasm.js"),
  logger: m => console.log(m), // optional: logs progress
});

// No need to call load/loadLanguage/initialize in v5
const ready = workerPromise;

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

    if (!image?.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "❌ Upload a valid image file.",
        ephemeral: true
      });
    }

    await interaction.reply("🔍 Reading image…");

    try {
      const worker = await ready;

      // Pass language as string for v5
      const { data } = await worker.recognize(image.url, "eng");
      const text = data.text.replace(/\s+/g, " ").trim();

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

// Optional: terminate worker on process exit
process.on("exit", async () => {
  const worker = await workerPromise;
  await worker.terminate();
});
