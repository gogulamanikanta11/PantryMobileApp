const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../git_push_log.txt');
fs.writeFileSync(logFile, 'Starting git push...\n');

const gitPath = 'C:\\Program Files\\Git\\cmd\\git.exe';

function runGit(args) {
  return new Promise((resolve, reject) => {
    fs.appendFileSync(logFile, `\n> git ${args.join(' ')}\n`);
    const proc = spawn(gitPath, args, { cwd: path.join(__dirname, '..') });
    
    proc.stdout.on('data', (data) => {
      fs.appendFileSync(logFile, data.toString());
    });
    
    proc.stderr.on('data', (data) => {
      fs.appendFileSync(logFile, data.toString());
    });
    
    proc.on('close', (code) => {
      fs.appendFileSync(logFile, `\nExit code: ${code}\n`);
      if (code === 0) resolve();
      else reject(new Error(`Git exit code ${code}`));
    });
  });
}

async function main() {
  try {
    await runGit(['add', '.']);
    await runGit(['commit', '-m', 'docs: implement E2E load metrics and AI meal planner updates']);
    await runGit(['push', 'origin', 'master']);
  } catch (err) {
    fs.appendFileSync(logFile, `\nError: ${err.message}\n`);
  }
}

main();
