import { SlashCommandBuilder } from "discord.js";
import Tesseract from "tesseract.js";  // or `import { createWorker } from 'tesseract.js';`
import path from "path";

let workerPromise = Tesseract.createWorker({
  workerPath: path.resolve("./node_modules/tesseract.js/dist/worker.min.js"),
  corePath: path.resolve("./node_modules/tesseract.js/dist/tesseract-core.wasm.js"),
  // langPath not always needed; Tesseract.js ships with bundled trained data
});

// optional: load the worker once and reuse
const ready = (async () => {
  const w = await workerPromise;
  return w;  // already “ready”
})();

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
      // Wait for worker to be ready
      const worker = await ready;

      const { data } = await worker.recognize(image.url);
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
  const w = await workerPromise;
  await w.terminate();
});
