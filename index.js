const { ConsoleConnector } = require('@nlpjs/console-connector');
const { dockStart } = require('@nlpjs/basic');
const { exec, spawn } = require('child_process');

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

function runCommandWithoutWaitingHandler(command, args = []) {
  try {
    const childProcess = spawn(command, args);

    childProcess.stdout.on('data', data => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });

    childProcess.on('close', code => {
      console.log(`child process (${command}) exited with code ${code}`);
    });
  } catch (e) {
    console.error(`Error running: ${command} (args: ${args.join(', ')})`);
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
        runCommandWithoutWaitingHandler('chromium');
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
