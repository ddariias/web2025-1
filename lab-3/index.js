import { Command } from "commander";
import fs from "fs";

const program = new Command();

program
  .version("1.0.0")
  .description("Програма для обробки JSON-файлу НБУ")
  .requiredOption("-i, --input <path>", "Шлях до файлу JSON (обов'язково)")
  .option("-o, --output <path>", "Шлях до вихідного файлу")
  .option("-d, --display", "Вивести результат у консоль")
  .parse(process.argv);

const options = program.opts();

if (!options.input) {
  console.error("Please, specify input file");
  process.exit(1);
}

 if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

const data = fs.readFileSync(options.input, "utf-8");
let jsonData;

try {
  jsonData = JSON.parse(data);
} catch (err) {
  console.error("Invalid JSON format");
  process.exit(1);
}
const exchangeRates = jsonData.map(entry => {
	const date = entry.exchangedate;
	const rate = entry.rate
	return `${date}:${rate}`;
});
if (options.display) {
  console.log(exchangeRates.join("\n"));
}

if (options.output) {
  fs.writeFileSync(options.output, exchangeRates.join("\n"));
  console.log(`Результат збережено у файл: ${options.output}`);
}
