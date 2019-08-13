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
  PrefixExpression,
  InfixExpression
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

const TOKEN_TYPE_PRECEDENCE: Map<TOKEN_TYPE, PRECEDENCE> = new Map();
TOKEN_TYPE_PRECEDENCE.set(TOKEN_TYPE.EQ, PRECEDENCE.EQUALS);
TOKEN_TYPE_PRECEDENCE.set(TOKEN_TYPE.NOT_EQ, PRECEDENCE.EQUALS);
TOKEN_TYPE_PRECEDENCE.set(TOKEN_TYPE.LT, PRECEDENCE.LESSGREATER);
TOKEN_TYPE_PRECEDENCE.set(TOKEN_TYPE.GT, PRECEDENCE.LESSGREATER);
TOKEN_TYPE_PRECEDENCE.set(TOKEN_TYPE.PLUS, PRECEDENCE.SUM);
TOKEN_TYPE_PRECEDENCE.set(TOKEN_TYPE.MINUS, PRECEDENCE.SUM);
TOKEN_TYPE_PRECEDENCE.set(TOKEN_TYPE.SLASH, PRECEDENCE.PRODUCT);
TOKEN_TYPE_PRECEDENCE.set(TOKEN_TYPE.ASTERISK, PRECEDENCE.PRODUCT);

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

    this.registerInfix(TOKEN_TYPE.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(
      TOKEN_TYPE.ASTERISK,
      this.parseInfixExpression.bind(this)
    );
    this.registerInfix(TOKEN_TYPE.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.NOT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.GT, this.parseInfixExpression.bind(this));
  }

  parseInfixExpression(left: Expression): Expression {
    // Save the current token before we move on
    const token = this.curToken;
    const operator = this.curToken.literal;

    // Get the current precedence
    const precedence = this.curPrecendence();
    // Progress to the next token
    this.nextToken();
    // Parse the next expression

    const right = this.parseExpression(precedence);
    return new InfixExpression(token, left, operator, right);
  }

  peekPrecendence(): number {
    if (TOKEN_TYPE_PRECEDENCE.has(this.peekToken.type))
      return TOKEN_TYPE_PRECEDENCE.get(this.peekToken.type);
    else return PRECEDENCE.LOWEST;
  }

  curPrecendence(): number {
    if (TOKEN_TYPE_PRECEDENCE.has(this.curToken.type))
      return TOKEN_TYPE_PRECEDENCE.get(this.curToken.type);
    else return PRECEDENCE.LOWEST;
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
    // Parse a prefix expression if there is one
    const prefix = this.prefixParseFns.get(this.curToken.type);
    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.type);
      return undefined;
    }
    let leftExp = prefix();

    // While there is a greater precedence ahead,
    // group up everything that is the left expression
    while (
      this.peekTokenIs(TOKEN_TYPE.SEMICOLON) === false &&
      precedence < this.peekPrecendence()
    ) {
      const infix = this.infixParseFns.get(this.peekToken.type);
      if (!infix) return leftExp;
      this.nextToken();
      leftExp = infix(leftExp);
    }
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
