const { SlackAdapter } = require('botbuilder-adapter-slack');
const { Botkit } = require('botkit');
const { dockStart } = require('@nlpjs/basic');

require('dotenv').config(); // load env vars from `.env` file

const {
  CLIENT_ID,
  CLIENT_SECRET,
  VERIFICATION_TOKEN,
  CLIENT_SIGNING_SECRET,
  BOT_TOKEN,
} = process.env;

const main = async () => {
  // create nlp engine
  const dock = await dockStart();
  // select nlp from the settings (conf.json)
  const nlp = dock.get('nlp');
  // train selected nlp (the data will be used according to conf.json -> corpus-en.json)
  await nlp.train();

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
    const { text } = message;

    if (text) {
      // Find the most suitable command for the user raw text
      const response = await nlp.process('en', text);
      await bot.reply(
        message,
        `I heard a message! text: ${message.text}, value: ${message.value}, NLP answer: ${response.answer}`
      );
    } else {
      await bot.reply(
        message,
        `Strange text: ${message.text}, value: ${message.value}`
      );
    }
  });
};

main().catch(e => {
  throw e;
});
