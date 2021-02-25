const { ConsoleConnector } = require('@nlpjs/console-connector');
const { dockStart } = require('@nlpjs/basic');
const { exec } = require('child_process');

const runCommand = async command => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        return reject(new Error(`stderr: ${stderr}`));
      }
      return resolve(stdout);
    });
  });
};

async function runCommandHandler(command) {
  try {
    console.log(await runCommand(command));
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

const main = async () => {
  const dock = await dockStart();
  const nlp = dock.get('nlp');
  await nlp.train();

  const connector = new ConsoleConnector();
  connector.onHear = async (self, text) => {
    self.say(`You said "${text}"`);
    const response = await nlp.process('en', text);
    console.log(`NLP answer: ${response.answer}`);
    switch (response.intent) {
      case 'run.browser':
        await runCommandHandler('chromium --version');
        break;
      case 'run.test':
        await runCommandHandler('npm test');
        break;
      case 'run.ls':
        await runCommandHandler('ls -al');
        break;
      case 'exit':
        connector.close();
        break;
      default:
        console.log(`Skipping case: ${response.intent}`);
        break;
    }
  };
  connector.say('Say something!');
};

main().catch(e => {
  throw e;
});
