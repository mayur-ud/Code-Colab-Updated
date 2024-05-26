import { spawn } from 'child_process';

const gqlServer = spawn('npm', ['run', 'gql'], { shell : false });

gqlServer.stdout.on('data', (data) => {
  console.log(`GQL Server stdout: ${data}`);
});

gqlServer.stderr.on('data', (data) => {
  console.error(`GQL Server stderr: ${data}`);
});

gqlServer.on('close', (code) => {
  console.log(`GQL Server process exited with code ${code}`);
});


const wsServer = spawn('npm', ['run', 'ws'], { shell : false});

wsServer.stdout.on('data', (data) => {
  console.log(`WS Server stdout: ${data}`);
});

wsServer.stderr.on('data', (data) => {
  console.error(`WS Server stderr: ${data}`);
});

wsServer.on('close', (code) => {
  console.log(`WS Server process exited with code ${code}`);
});
