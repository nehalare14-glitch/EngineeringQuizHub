const fs = require("fs");
const { parse } = require("csv-parse/sync");

const csv = fs.readFileSync(
  "../backend/data/questions/question_bank.csv",
  "utf8"
);

const rows = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  bom: true,
  trim: true
});

console.log("CSV parsing successful");
console.log("Questions:", rows.length);
