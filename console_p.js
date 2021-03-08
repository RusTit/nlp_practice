const { ConsoleConnector } = require('@nlpjs/console-connector');
const { dockStart } = require('@nlpjs/basic');
const { exec, spawn } = require('child_process');

// Helper function that convert common Nodejs app/command invoker into Promise
// based. Promise will finished only AFTER app/command will finish
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

// Run command or app and WAIT until it finished. While waiting,
// this script cannot process new input and run others commands
async function runCommandHandler(command) {
  try {
    console.log(await runCommand(command));
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

// Run app or command, but DON't wait until it finished.
// The app output will be in same console, so potentially can generate some mess
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

// App entry point
const main = async () => {
  // create nlp engine
  const dock = await dockStart();
  // select nlp from the settings (conf.json)
  const nlp = dock.get('nlp');
  // train selected nlp (the data will be used according to conf.json -> corpus-en.json)
  await nlp.train();

  // Helper for running script as user console app. Allow to get user input from the terminal
  const connector = new ConsoleConnector();
  // Event-function will be invoked each time user type the text and press Enter
  connector.onHear = async (self, text) => {
    self.say(`You said "${text}"`);
    // Find the most suitable command for the user raw text
    const response = await nlp.process('en', text);
    console.log(`NLP answer: ${response.answer}`);
    // Check the match object and run/execute related app/command/stuff
    // intent(s) are described in the corpus-en.json
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
