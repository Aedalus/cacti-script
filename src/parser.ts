import { Lexer } from "./lexer";
import { Token, TOKEN_TYPE } from "./token";
import {
  Program,
  LetStatement,
  Identifier,
  Statement,
  ReturnStatement,
  Expression,
  ExpressionStatement,
  IntegerLiteral,
  PrefixExpression
} from "./ast/ast";

type prefixParseFn = () => Expression;
type infixParseFn = (expression: Expression) => Expression;

enum PRECEDENCE {
  LOWEST = 0,
  EQUALS = 1,
  LESSGREATER = 2,
  SUM = 3,
  PRODUCT = 4,
  PREFIX = 5,
  CALL = 6
}

export class Parser {
  lexer: Lexer;
  errors: string[] = [];

  curToken: Token;
  peekToken: Token;

  prefixParseFns: Map<TOKEN_TYPE, prefixParseFn> = new Map();
  infixParseFns: Map<TOKEN_TYPE, infixParseFn> = new Map();

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.nextToken();
    this.nextToken();

    this.registerPrefix(TOKEN_TYPE.IDENT, this.parseIdentifier.bind(this));
    this.registerPrefix(TOKEN_TYPE.INT, this.parseIntegerLiteral.bind(this));
    this.registerPrefix(TOKEN_TYPE.BANG, this.parsePrefixExpression.bind(this));
    this.registerPrefix(
      TOKEN_TYPE.MINUS,
      this.parsePrefixExpression.bind(this)
    );
  }

  parsePrefixExpression() {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.literal
    );
    this.nextToken();
    expression.right = this.parseExpression(PRECEDENCE.PREFIX);
    return expression;
  }
  parseIdentifier() {
    return new Identifier(this.curToken, this.curToken.literal);
  }

  parseIntegerLiteral() {
    const lit = new IntegerLiteral(this.curToken);
    try {
      const value = Number.parseInt(this.curToken.literal, 10);
      lit.value = value;
      return lit;
    } catch (err) {
      this.errors.push(`Could not parse ${this.curToken.literal} as integer`);
    }
  }

  noPrefixParseFnError(tokenType: TOKEN_TYPE) {
    this.errors.push(`no prefix parse function for ${tokenType} found`);
  }

  getErrors() {
    return this.errors;
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  registerPrefix(tokenType: TOKEN_TYPE, fn: prefixParseFn) {
    this.prefixParseFns.set(tokenType, fn);
  }

  registerInfix(tokenType: TOKEN_TYPE, fn: infixParseFn) {
    this.infixParseFns.set(tokenType, fn);
  }

  parseProgram(): Program {
    const program = new Program();

    while (!this.curTokenIs(TOKEN_TYPE.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) program.statements.push(stmt);
      this.nextToken();
    }
    return program;
  }

  parseStatement(): Statement | undefined {
    switch (this.curToken.type) {
      case TOKEN_TYPE.LET:
        return this.parseLetStatement();
      case TOKEN_TYPE.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseExpressionStatement() {
    const statement = new ExpressionStatement(this.curToken);

    statement.expression = this.parseExpression(PRECEDENCE.LOWEST);
    if (this.peekTokenIs(TOKEN_TYPE.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  parseExpression(precedence: PRECEDENCE) {
    const prefix = this.prefixParseFns.get(this.curToken.type);
    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.type);
      return undefined;
    }
    const leftExp = prefix();
    return leftExp;
  }

  parseLetStatement() {
    const stmt = new LetStatement(this.curToken);

    if (!this.expectPeek(TOKEN_TYPE.IDENT)) {
      return undefined;
    }

    stmt.name = new Identifier(this.curToken, this.curToken.literal);

    if (!this.expectPeek(TOKEN_TYPE.ASSIGN)) {
      return undefined;
    }

    //TODO: We're skipping the expressions until we encounter a semicolon
    while (!this.curTokenIs(TOKEN_TYPE.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  parseReturnStatement() {
    const stmt = new ReturnStatement(this.curToken);
    this.nextToken();

    while (!this.curTokenIs(TOKEN_TYPE.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  curTokenIs(token: TOKEN_TYPE): boolean {
    return this.curToken.type === token;
  }

  peekTokenIs(token: TOKEN_TYPE): boolean {
    return this.peekToken.type === token;
  }

  expectPeek(token: TOKEN_TYPE): boolean {
    if (this.peekTokenIs(token)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(token);
      return false;
    }
  }

  peekError(token: TOKEN_TYPE) {
    this.errors.push(
      `expected next token to be ${token}, got ${this.peekToken.type} instead`
    );
  }
}
