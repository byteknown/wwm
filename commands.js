// commands.js

export const ping = {
  name: 'ping',
  description: 'Replies with Pong!',
  async execute(message, args) {
    await message.reply('Pong!');
  }
};

export const say = {
  name: 'say',
  description: 'Repeats your message.',
  async execute(message, args) {
    if (!args.length) return message.reply('You need to provide a message!');
    await message.channel.send(args.join(' '));
  }
};
