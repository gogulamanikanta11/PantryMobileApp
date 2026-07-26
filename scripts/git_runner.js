const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const cmd = process.argv.slice(2).join(' ') || 'git status';
console.log(`Running command: ${cmd}`);

exec(cmd, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
  const result = {
    error: error ? error.message : null,
    stdout,
    stderr
  };
  console.log('Finished. Output written to git_output_node.json');
  fs.writeFileSync(
    path.join(__dirname, '../git_output_node.json'),
    JSON.stringify(result, null, 2)
  );
});
