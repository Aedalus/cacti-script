"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var index_1 = require("../index");
var program = require("commander");
program
    .command("tokenize <file>")
    .description("Tokenizes a file and prints the individual tokens")
    .action(function (file) {
    console.log("Tokenizing", file);
    if (path.extname(file) !== ".cacti") {
        console.error("Error: File does not end with .cacti");
        process.exit(1);
    }
    var input = fs.readFileSync(path.resolve(file)).toString();
    var lexer = new index_1.Lexer(input);
    while (true) {
        var token = lexer.nextToken();
        console.log(token.type, token.literal);
        if (token.type === index_1.TOKEN_TYPE.EOF)
            break;
    }
});
program
    .command("parse <file>")
    .description("Parses a file and prints the statements")
    .action(function (file) {
    console.log("Parsing", file);
    if (path.extname(file) !== ".cacti") {
        console.error("Error: File does not end with .cacti");
        process.exit(1);
    }
    var input = fs.readFileSync(path.resolve(file)).toString();
    var lexer = new index_1.Lexer(input);
    var parser = new index_1.Parser(lexer);
    if (parser.errors.length) {
        parser.errors.forEach(function (x) { return console.log(x); });
        process.exit(1);
    }
    var program = parser.parseProgram();
    program.statements.forEach(function (x) { return console.log(x); });
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map