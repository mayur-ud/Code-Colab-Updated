const { spawn } = require('child_process');

const gqlServer = spawn('npm', ['run', 'gql'], { cwd: './backend' , shell : false });

gqlServer.stdout.on('data', (data) => {
  console.log(`GQL Server stdout: ${data}`);
});

gqlServer.stderr.on('data', (data) => {
  console.error(`GQL Server stderr: ${data}`);
});

gqlServer.on('close', (code) => {
  console.log(`GQL Server process exited with code ${code}`);
});


const wsServer = spawn('npm', ['run', 'ws'], { cwd: './backend' , shell : false});

wsServer.stdout.on('data', (data) => {
  console.log(`WS Server stdout: ${data}`);
});

wsServer.stderr.on('data', (data) => {
  console.error(`WS Server stderr: ${data}`);
});

wsServer.on('close', (code) => {
  console.log(`WS Server process exited with code ${code}`);
});

  const reactFrontend = spawn('npm', ['run', 'dev'], { cwd: './frontend' , shell : false});

reactFrontend.stdout.on('data', (data) => {
  console.log(`React Frontend stdout: ${data}`);
});

reactFrontend.stderr.on('data', (data) => {
  console.error(`React Frontend stderr: ${data}`);
});

reactFrontend.on('close', (code) => {
  console.log(`React Frontend process exited with code ${code}`);
});
