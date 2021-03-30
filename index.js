const { SlackAdapter } = require('botbuilder-adapter-slack');
const { Botkit } = require('botkit');

require('dotenv').config(); // load env vars from `.env` file

// https://botkit.ai/docs/v4/reference/slack.html#SlackAdapterOptions
const adapter = new SlackAdapter({
  clientSigningSecret: process.env.SLACK_SECRET,
  botToken: process.env.SLACK_TOKEN,
});

const controller = new Botkit({
  adapter,
  // ...other options
});

controller.on('message', async (bot, message) => {
  await bot.reply(
    message,
    `I heard a message! text: ${message.text}, value: ${message.value}`
  );
});
