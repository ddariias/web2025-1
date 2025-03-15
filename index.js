const fs = require('fs');
const path = require('path');
const commander = require('commander');
const program = new commander.Command();

program
  .option('-i, --input <file>', 'Path to input JSON file', String)
  .option('-o, --output <file>', 'Path to output file', String)
  .option('-d, --display', 'Display result in console');

program.parse(process.argv);

if (!program.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

const inputFile = path.resolve(program.input);
if (!fs.existsSync(inputFile)) {
  console.error('Cannot find input file');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

if (program.display) {
  console.log(data);
}

if (program.output) {
  const outputFile = path.resolve(program.output);
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2)); 
}
