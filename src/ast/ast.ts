import { Token } from "../token";
export interface Node {
  tokenLiteral(): string;
  string(): string;
}

export interface Statement extends Node {
  statementNode: () => any;
}

export interface Expression extends Node {
  expressionNode: () => any;
}

export class Program implements Node {
  statements: Statement[] = [];
  string() {
    return this.statements.map(x => x.string()).join("");
  }
  tokenLiteral() {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return "";
    }
  }
}

export class Identifier implements Expression {
  token: Token;
  value: string;

  constructor(token: Token, value: string) {
    this.token = token;
    this.value = value;
  }

  string() {
    return this.value;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
}

export class LetStatement implements Statement {
  token: Token;
  name: Identifier;
  value: Expression;

  constructor(token: Token) {
    this.token = token;
  }

  string() {
    return (
      this.tokenLiteral() +
      " " +
      this.name.string() +
      " = " +
      (this.value && this.value.string()) +
      ";"
    );
  }
  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }
}

export class ReturnStatement implements Statement {
  token: Token;
  returnValue: Expression;

  constructor(token: Token) {
    this.token = token;
  }
  string() {
    return (
      this.tokenLiteral() +
      (this.returnValue && this.returnValue.string()) +
      ";"
    );
  }
  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
}

export class ExpressionStatement implements Statement {
  token: Token;
  expression: Expression;

  constructor(token: Token) {
    this.token = token;
  }
  string() {
    return this.expression ? this.expression.string() : "";
  }
  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
}

export class IntegerLiteral implements Expression {
  token: Token;
  value: number;

  constructor(token: Token) {
    this.token = token;
  }
  string() {
    return this.token.literal;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
}

export class PrefixExpression implements Expression {
  token: Token;
  operator: string;
  right: Expression;

  constructor(token: Token, operator: string) {
    this.token = token;
    this.operator = operator;
  }

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `(${this.operator}${this.right.string()})`;
  }
}

export class InfixExpression implements Expression {
  token: Token;
  left: Expression;
  operator: string;
  right: Expression;

  constructor(
    token: Token,
    left: Expression,
    operator: string,
    right: Expression
  ) {
    this.token = token;
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string() {
    return (
      "(" +
      this.left.string() +
      ` ${this.operator} ` +
      this.right.string() +
      ")"
    );
  }
}
