import * as path from "path";
import * as fs from "fs";

import { evalNode, Lexer, Parser, TOKEN_TYPE } from "../index";
import { Environment } from "../environment";
const program = require("commander");

program
  .command("tokenize <file>")
  .description("Tokenizes a file and prints the individual tokens")
  .action((file: string) => {
    console.log("Tokenizing", file);

    if (path.extname(file) !== ".cacti") {
      console.error("Error: File does not end with .cacti");
      process.exit(1);
    }

    const input = fs.readFileSync(path.resolve(file)).toString();
    const lexer = new Lexer(input);

    while (true) {
      const token = lexer.nextToken();
      console.log(token.type, token.literal);
      if (token.type === TOKEN_TYPE.EOF) break;
    }
  });

program
  .command("parse <file>")
  .description("Parses a file and prints the statements")
  .action((file: string) => {
    console.log("Parsing", file);
    if (path.extname(file) !== ".cacti") {
      console.error("Error: File does not end with .cacti");
      process.exit(1);
    }

    const input = fs.readFileSync(path.resolve(file)).toString();
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    if (parser.errors.length) {
      parser.errors.forEach(x => console.log(x));
      process.exit(1);
    }

    const program = parser.parseProgram();
    program.statements.forEach(x => console.log(x));
  });

program
  .command("run <file>")
  .description("Runs a file and prints the output")
  .action((file: string) => {
    if (path.extname(file) !== ".cacti") {
      console.error("Error: File does not end with .cacti");
      process.exit(1);
    }

    const input = fs.readFileSync(path.resolve(file)).toString();
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    if (parser.errors.length) {
      parser.errors.forEach(x => console.log(x));
      process.exit(1);
    }

    const program = parser.parseProgram();
    const evaluated = evalNode(program, new Environment());
    if (evaluated) {
      console.log(evaluated.inspect());
    }
  });
program.parse(process.argv);
