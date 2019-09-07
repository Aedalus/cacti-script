"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var token_1 = require("./token");
var isLetter = function (char) {
    if (char.length !== 1)
        throw new Error("Tried to parse " + char + " as letter");
    return (("a" <= char && char <= "z") || ("a" <= char && char <= "z") || char === "_");
};
var isDigit = function (char) {
    if (char.length !== 1)
        throw new Error("Tried to parse " + char + " as number");
    return "0" <= char && char <= "9";
};
var Lexer = (function () {
    function Lexer(input) {
        this.position = 0;
        this.readPosition = 0;
        this.input = input;
        this.readChar();
    }
    Lexer.prototype.readChar = function () {
        if (this.readPosition >= this.input.length) {
            this.ch = undefined;
        }
        else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition++;
    };
    Lexer.prototype.skipWhitespace = function () {
        while (this.ch === " " ||
            this.ch == "\t" ||
            this.ch === "\n" ||
            this.ch == "\r")
            this.readChar();
    };
    Lexer.prototype.nextToken = function () {
        this.skipWhitespace();
        var token;
        if (this.ch === "=") {
            if (this.peekChar() === "=") {
                token = { type: token_1.TOKEN_TYPE.EQ, literal: this.ch + this.peekChar() };
                this.readChar();
            }
            else {
                token = { type: token_1.TOKEN_TYPE.ASSIGN, literal: this.ch };
            }
        }
        else if (this.ch === "!") {
            if (this.peekChar() === "=") {
                token = {
                    type: token_1.TOKEN_TYPE.NOT_EQ,
                    literal: this.ch + this.peekChar()
                };
                this.readChar();
            }
            else {
                token = { type: token_1.TOKEN_TYPE.BANG, literal: this.ch };
            }
        }
        else if (this.ch === ";") {
            token = { type: token_1.TOKEN_TYPE.SEMICOLON, literal: this.ch };
        }
        else if (this.ch === "(") {
            token = { type: token_1.TOKEN_TYPE.LPAREN, literal: this.ch };
        }
        else if (this.ch === ")") {
            token = { type: token_1.TOKEN_TYPE.RPAREN, literal: this.ch };
        }
        else if (this.ch === ",") {
            token = { type: token_1.TOKEN_TYPE.COMMA, literal: this.ch };
        }
        else if (this.ch === "+") {
            token = { type: token_1.TOKEN_TYPE.PLUS, literal: this.ch };
        }
        else if (this.ch === "{") {
            token = { type: token_1.TOKEN_TYPE.LBRACE, literal: this.ch };
        }
        else if (this.ch === "}") {
            token = { type: token_1.TOKEN_TYPE.RBRACE, literal: this.ch };
        }
        else if (this.ch === "-") {
            token = { type: token_1.TOKEN_TYPE.MINUS, literal: this.ch };
        }
        else if (this.ch === "*") {
            token = { type: token_1.TOKEN_TYPE.ASTERISK, literal: this.ch };
        }
        else if (this.ch === "/") {
            token = { type: token_1.TOKEN_TYPE.SLASH, literal: this.ch };
        }
        else if (this.ch === ">") {
            token = { type: token_1.TOKEN_TYPE.GT, literal: this.ch };
        }
        else if (this.ch === "<") {
            token = { type: token_1.TOKEN_TYPE.LT, literal: this.ch };
        }
        else if (this.ch === undefined) {
            token = { type: token_1.TOKEN_TYPE.EOF, literal: "" };
        }
        else {
            if (isLetter(this.ch)) {
                var literal = this.readIdentifier();
                var type = token_1.lookupIdent(literal);
                return { type: type, literal: literal };
            }
            else if (isDigit(this.ch)) {
                return { type: token_1.TOKEN_TYPE.INT, literal: this.readNumber() };
            }
            else {
                console.error("Unrecognized token found", this.ch);
                token = { type: token_1.TOKEN_TYPE.ILLEGAL, literal: this.ch };
            }
        }
        this.readChar();
        return token;
    };
    Lexer.prototype.readIdentifier = function () {
        var startPosition = this.position;
        while (isLetter(this.ch)) {
            this.readChar();
        }
        return this.input.slice(startPosition, this.position);
    };
    Lexer.prototype.readNumber = function () {
        var startPosition = this.position;
        while (isDigit(this.ch)) {
            this.readChar();
        }
        return this.input.slice(startPosition, this.position);
    };
    Lexer.prototype.peekChar = function () {
        if (this.readPosition >= this.input.length) {
            return undefined;
        }
        else {
            return this.input[this.readPosition];
        }
    };
    return Lexer;
}());
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map