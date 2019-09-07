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

export class Boolean implements Expression {
  token: Token;
  value: boolean;

  constructor(token: Token, value: boolean) {
    this.token = token;
    this.value = value;
  }

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string() {
    return this.token.literal;
  }
}

export class IfExpression implements Expression {
  token: Token;
  condition: Expression;
  consequence: BlockStatement;
  alternative: BlockStatement;

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string() {
    let buf = "if" + this.condition.string() + " " + this.consequence.string();

    if (this.alternative) {
      buf += "else " + this.alternative.string();
    }
    return buf;
  }
}

export class BlockStatement implements Statement {
  token: Token;
  statements: Statement[] = [];

  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string() {
    let buf = "";
    for (let s of this.statements) {
      buf += s.string();
    }
    return buf;
  }
}

export class FunctionLiteral implements Expression {
  token: Token;
  parameters: Identifier[] = [];
  body: BlockStatement;

  constructor(token: Token) {
    this.token = token;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string() {
    let buf = "";

    buf += this.tokenLiteral();
    buf += "(";
    buf += this.parameters.map(x => x.string()).join(",");
    buf += ") ";
    buf += this.body.string();

    return buf;
  }
}

export class CallExpression implements Expression {
  token: Token;
  function: Expression;
  arguments: Expression[];

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  string() {
    let buf = "";

    buf += this.function.string();
    buf += "(";
    buf += this.arguments.map(x => x.string()).join(",");
    buf += ")";

    return buf;
  }
}
