import { TOKEN_TYPE, Token, lookupIdent } from "./token";

const isLetter = (char: string): boolean => {
  if (char.length !== 1) throw new Error(`Tried to parse ${char} as letter`);
  return (
    ("a" <= char && char <= "z") || ("A" <= char && char <= "Z") || char === "_"
  );
};

const isDigit = (char: string): boolean => {
  if (char.length !== 1) throw new Error(`Tried to parse ${char} as number`);
  return "0" <= char && char <= "9";
};

export class Lexer {
  input: string;
  position: number = 0;
  readPosition: number = 0;
  ch?: string;

  constructor(input: string) {
    this.input = input;
    this.readChar();
  }

  readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = undefined;
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition++;
  }

  skipWhitespace() {
    while (
      this.ch === " " ||
      this.ch == "\t" ||
      this.ch === "\n" ||
      this.ch == "\r"
    )
      this.readChar();
  }

  readString(): string {
    const position = this.position + 1;
    while (true) {
      this.readChar();
      if (this.ch === '"' || this.ch === undefined) {
        break;
      }
    }
    return this.input.slice(position, this.position);
  }

  nextToken(): Token {
    this.skipWhitespace();

    let token: Token;
    if (this.ch === '"') {
      token = { type: TOKEN_TYPE.STRING, literal: this.readString() };
    } else if (this.ch === "=") {
      if (this.peekChar() === "=") {
        token = { type: TOKEN_TYPE.EQ, literal: this.ch + this.peekChar() };
        this.readChar();
      } else {
        token = { type: TOKEN_TYPE.ASSIGN, literal: this.ch };
      }
    } else if (this.ch === "!") {
      if (this.peekChar() === "=") {
        token = {
          type: TOKEN_TYPE.NOT_EQ,
          literal: this.ch + this.peekChar()
        };
        this.readChar();
      } else {
        token = { type: TOKEN_TYPE.BANG, literal: this.ch };
      }
    } else if (this.ch === ";") {
      token = { type: TOKEN_TYPE.SEMICOLON, literal: this.ch };
    } else if (this.ch === "(") {
      token = { type: TOKEN_TYPE.LPAREN, literal: this.ch };
    } else if (this.ch === ")") {
      token = { type: TOKEN_TYPE.RPAREN, literal: this.ch };
    } else if (this.ch === ",") {
      token = { type: TOKEN_TYPE.COMMA, literal: this.ch };
    } else if (this.ch === "+") {
      token = { type: TOKEN_TYPE.PLUS, literal: this.ch };
    } else if (this.ch === "{") {
      token = { type: TOKEN_TYPE.LBRACE, literal: this.ch };
    } else if (this.ch === "}") {
      token = { type: TOKEN_TYPE.RBRACE, literal: this.ch };
    } else if (this.ch === "-") {
      token = { type: TOKEN_TYPE.MINUS, literal: this.ch };
    } else if (this.ch === "*") {
      token = { type: TOKEN_TYPE.ASTERISK, literal: this.ch };
    } else if (this.ch === "/") {
      token = { type: TOKEN_TYPE.SLASH, literal: this.ch };
    } else if (this.ch === ">") {
      token = { type: TOKEN_TYPE.GT, literal: this.ch };
    } else if (this.ch === "<") {
      token = { type: TOKEN_TYPE.LT, literal: this.ch };
    } else if (this.ch === undefined) {
      token = { type: TOKEN_TYPE.EOF, literal: "" };
    } else {
      if (isLetter(this.ch)) {
        const literal = this.readIdentifier();
        const type = lookupIdent(literal);
        return { type, literal };
      } else if (isDigit(this.ch)) {
        return { type: TOKEN_TYPE.INT, literal: this.readNumber() };
      } else {
        console.error("Unrecognized token found", this.ch);
        token = { type: TOKEN_TYPE.ILLEGAL, literal: this.ch };
      }
    }

    this.readChar();
    return token;
  }

  readIdentifier(): string {
    const startPosition = this.position;
    while (isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(startPosition, this.position);
  }

  readNumber() {
    const startPosition = this.position;
    while (isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(startPosition, this.position);
  }

  peekChar() {
    if (this.readPosition >= this.input.length) {
      return undefined;
    } else {
      return this.input[this.readPosition];
    }
  }
}
