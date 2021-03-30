const { SlackAdapter } = require('botbuilder-adapter-slack');
const { Botkit } = require('botkit');

require('dotenv').config(); // load env vars from `.env` file

const {
  CLIENT_ID,
  CLIENT_SECRET,
  VERIFICATION_TOKEN,
  CLIENT_SIGNING_SECRET,
  BOT_TOKEN,
} = process.env;

// https://botkit.ai/docs/v4/reference/slack.html#SlackAdapterOptions
const adapter = new SlackAdapter({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  botToken: BOT_TOKEN,
  clientSigningSecret: CLIENT_SIGNING_SECRET,
  verificationToken: VERIFICATION_TOKEN,
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
