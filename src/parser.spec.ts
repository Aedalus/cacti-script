import { Parser } from "./parser";
import { Lexer } from "./lexer";
import * as AST from "./ast/ast";

function testLiteralExpression(exp: AST.Expression, value: any) {
  if (exp instanceof AST.Identifier) {
    if (exp.value !== value)
      throw new Error(`${JSON.stringify(exp)} does not match value`);
  } else if (exp instanceof AST.IntegerLiteral) {
    if (exp.value !== value) {
      console.error(exp);
      throw new Error(`${exp.value} does not match ${value}`);
    }
  } else {
    console.error(exp);
    throw new Error(`expression type not recognized ${JSON.stringify(exp)}`);
  }
}

function testInfixExpression(
  exp: AST.Expression,
  vA: any,
  op: string,
  vB: any
) {
  if (exp instanceof AST.InfixExpression === false) {
    console.error(exp);
    throw new Error(`exp was not an infix expression`);
  }
  const infixExp = exp as AST.InfixExpression;
  testLiteralExpression(infixExp.left, vA);
  testLiteralExpression(infixExp.right, vB);
  if (infixExp.operator !== op) {
    console.error(exp);
    throw new Error(`Operator ${infixExp.operator} does not match ${op}`);
  }
}

function testIdentifier(exp: AST.Expression, value: string) {
  if (exp instanceof AST.Identifier == false)
    throw new Error("Expression should be an identifier");

  const cast = exp as AST.Identifier;
  if (cast.value !== value)
    throw new Error(
      `Expected ident to have value ${value}. Received ${cast.value}`
    );

  if (cast.tokenLiteral() !== value) {
    throw new Error(
      `Expected tokenLiteral to be ${value}. Got ${cast.tokenLiteral()}`
    );
  }
}

function testIntegerLiteral(exp: AST.Expression, value: number) {
  if (exp instanceof AST.IntegerLiteral == false)
    throw new Error("Expression should be an IntegerLiteral");
  const cast = exp as AST.IntegerLiteral;

  if (cast.value !== value)
    throw new Error(`Expected ${value}, got ${cast.value}`);

  if (cast.tokenLiteral() !== value.toString())
    throw new Error(
      `Expected Token Literal to be ${value.toString()}. Got ${cast.tokenLiteral()}`
    );
}

describe("parser", () => {
  it("Can parse a let statement", () => {
    const input = `
    let x = 5;
    let y = 10;
    let foobar = 838383;`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    expect(parser.errors).toHaveLength(0);

    expect(program).toBeTruthy();
    expect(program.statements).toHaveLength(3);
    expect(program.statements[0]).toBeInstanceOf(AST.LetStatement);
    expect(program.statements[1]).toBeInstanceOf(AST.LetStatement);
    expect(program.statements[2]).toBeInstanceOf(AST.LetStatement);

    expect(program.statements[0].tokenLiteral()).toEqual("let");
    expect(program.statements[1].tokenLiteral()).toEqual("let");
    expect(program.statements[2].tokenLiteral()).toEqual("let");
  });

  it("Can parse a return statement", () => {
    const input = `
return 5;
return 10;
return 993322;
    `.trim();

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(parser.errors).toHaveLength(0);

    expect(program.statements).toHaveLength(3);

    expect(program.statements[0]).toBeInstanceOf(AST.ReturnStatement);
    expect(program.statements[1]).toBeInstanceOf(AST.ReturnStatement);
    expect(program.statements[2]).toBeInstanceOf(AST.ReturnStatement);

    expect(program.statements[0].tokenLiteral()).toEqual("return");
    expect(program.statements[1].tokenLiteral()).toEqual("return");
    expect(program.statements[2].tokenLiteral()).toEqual("return");
  });

  it("Can detect an identifier expression", () => {
    const input = "foobar;";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(parser.errors).toHaveLength(0);

    expect(program.statements).toHaveLength(1);
    const stmt = program.statements[0] as AST.ExpressionStatement;
    const ident = stmt.expression as AST.Identifier;
    expect(ident.value).toEqual("foobar");
    expect(ident.tokenLiteral()).toEqual("foobar");
  });

  it("Can detect a literal expression", () => {
    const input = "5;";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(parser.errors).toHaveLength(0);

    expect(program.statements).toHaveLength(1);

    const stmt = program.statements[0] as AST.ExpressionStatement;
    const literal = stmt.expression as AST.IntegerLiteral;
    expect(literal.value).toEqual(5);
    expect(literal.tokenLiteral()).toEqual("5");
  });

  it("Can detect prefix expressions", () => {
    const tests = [
      {
        input: "!5;",
        operator: "!",
        value: 5,
        valueType: AST.IntegerLiteral
      },
      {
        input: "-15;",
        operator: "-",
        value: 15,
        valueType: AST.IntegerLiteral
      },
      {
        input: "!true;",
        operator: "!",
        value: true,
        valueType: AST.Boolean
      },
      {
        input: "!false;",
        operator: "!",
        value: false,
        valueType: AST.Boolean
      }
    ];
    for (let { input, operator, value, valueType } of tests) {
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      expect(p.errors).toHaveLength(0);

      expect(program.statements).toHaveLength(1);
      const stmt = program.statements[0] as AST.ExpressionStatement;
      const exp = stmt.expression as AST.PrefixExpression;
      expect(exp.operator).toEqual(operator);

      expect(exp.right).toBeInstanceOf(valueType);
      expect((exp.right as any).value).toEqual(value);
    }
  });

  it("Can detect boolean infix operators", () => {
    const tests: [string, boolean, string, boolean][] = [
      ["true == true;", true, "==", true],
      ["true == false;", true, "==", false],
      ["true != false;", true, "!=", false]
    ];

    for (let [input, lExp, op, rExp] of tests) {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      if (parser.errors.length) {
        console.log(input);
        expect(parser.errors).toHaveLength(0);
      }

      expect(program.statements[0]).toBeInstanceOf(AST.ExpressionStatement);
      const statement = program.statements[0] as AST.ExpressionStatement;
      expect(statement.expression).toBeInstanceOf(AST.InfixExpression);
      const infix = statement.expression as AST.InfixExpression;

      expect(infix.left).toBeInstanceOf(AST.Boolean);
      const left = infix.left as AST.Boolean;
      expect(left.value).toEqual(lExp);

      expect(infix.operator).toEqual(op);

      expect(infix.right).toBeInstanceOf(AST.Boolean);
      const right = infix.right as AST.Boolean;
      expect(right.value).toEqual(rExp);
    }
  });

  it("Can detect infix operators", () => {
    const tests: [string, number, string, number][] = [
      ["5 + 5;", 5, "+", 5],
      ["5 - 5;", 5, "-", 5],
      ["5 * 5;", 5, "*", 5],
      ["5 / 5;", 5, "/", 5],
      ["5 > 5;", 5, ">", 5],
      ["5 < 5;", 5, "<", 5],
      ["5 == 5;", 5, "==", 5],
      ["5 != 5;", 5, "!=", 5]
    ];

    for (let [input, lExp, op, rExp] of tests) {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      if (parser.errors.length) {
        console.log(input);
        expect(parser.errors).toHaveLength(0);
      }

      expect(program.statements[0]).toBeInstanceOf(AST.ExpressionStatement);
      const statement = program.statements[0] as AST.ExpressionStatement;

      expect(statement.expression).toBeInstanceOf(AST.InfixExpression);
      const exp = statement.expression as AST.InfixExpression;

      expect(() => testIntegerLiteral(exp.left, lExp)).not.toThrow();
      expect(exp.operator).toEqual(op);
      expect(() => testIntegerLiteral(exp.right, rExp)).not.toThrow();
    }
  });

  it("Can detect operator precedence", () => {
    const assertProgramString = (input: string, assertion: string) => {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      expect(parser.errors).toHaveLength(0);
      const program = parser.parseProgram();
      expect(program.string()).toEqual(assertion);
    };
    const programStrings: [string, string][] = [
      ["-a * b;", "((-a) * b)"],
      ["!-a;", "(!(-a))"],
      ["a + b + c;", "((a + b) + c)"],
      ["a + b - c;", "((a + b) - c)"],
      ["a * b * c;", "((a * b) * c)"],
      ["a * b / c;", "((a * b) / c)"],
      ["a + b / c;", "(a + (b / c))"],
      ["a + b * c + d / e - f;", "(((a + (b * c)) + (d / e)) - f)"],
      ["3 + 4; -5 * 5;", "(3 + 4)((-5) * 5)"],
      ["5 > 4 == 3 < 4;", "((5 > 4) == (3 < 4))"],
      ["5 < 4 != 3 > 4;", "((5 < 4) != (3 > 4))"],
      ["3 + 4 * 5 == 3 * 1 + 4 * 5;", "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))"],
      ["3 > 5 == false;", "((3 > 5) == false)"],
      ["3 < 5 == true;", "((3 < 5) == true)"],
      ["1 + (2 + 3) + 4;", "((1 + (2 + 3)) + 4)"],
      ["(5 + 5) * 2;", "((5 + 5) * 2)"],
      ["2 / (5 + 5);", "(2 / (5 + 5))"],
      ["-(5 + 5);", "(-(5 + 5))"],
      ["!(true == true);", "(!(true == true))"]
    ];

    for (let [program, expected] of programStrings) {
      assertProgramString(program, expected);
    }
  });

  it("It can detect booleans", () => {
    // throw new Error("ToDo");
  });

  it("Can detect an if expression", () => {
    const input = "if (x < y) { x };";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    expect(parser.errors).toHaveLength(0);
    const program = parser.parseProgram();

    expect(program.statements).toHaveLength(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(AST.ExpressionStatement);
    const expStmt = stmt as AST.ExpressionStatement;
    expect(expStmt.expression).toBeInstanceOf(AST.IfExpression);
    const ifExp = expStmt.expression as AST.IfExpression;

    expect(ifExp.condition).toBeInstanceOf(AST.InfixExpression);
    const exp = ifExp.condition as AST.InfixExpression;

    // expect(() => testIntegerLiteral(exp.left, lExp)).not.toThrow();
    // expect(exp.operator).toEqual(op);
    // expect(() => testIntegerLiteral(exp.right, rExp)).not.toThrow();
    // ToDo
  });

  it("Can detect a function literal", () => {
    const input = "fn(x,y) { x + y; }";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(parser.errors).toHaveLength(0);

    expect(program.statements).toHaveLength(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(AST.ExpressionStatement);

    const exp = stmt as AST.ExpressionStatement;
    expect(exp.expression).toBeInstanceOf(AST.FunctionLiteral);
    const func = exp.expression as AST.FunctionLiteral;

    expect(func.parameters).toHaveLength(2);
    testLiteralExpression(func.parameters[0], "x");
    testLiteralExpression(func.parameters[1], "y");

    expect(func.body.statements).toHaveLength(1);
    expect(func.body.statements[0]).toBeInstanceOf(AST.ExpressionStatement);
    const bodyStmt = func.body.statements[0] as AST.ExpressionStatement;

    testInfixExpression(bodyStmt.expression, "x", "+", "y");
  });

  it("Can detect function parameters", () => {
    const tests: { input: string; expectedParams: string[] }[] = [
      { input: "fn() {}", expectedParams: [] },
      { input: "fn(x) {}", expectedParams: ["x"] },
      { input: "fn(x,y,z) {}", expectedParams: ["x", "y", "z"] }
    ];

    for (let { input, expectedParams } of tests) {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(parser.errors).toHaveLength(0);

      const stmt = program.statements[0] as AST.ExpressionStatement;
      const func = stmt.expression as AST.FunctionLiteral;

      expect(func.parameters).toHaveLength(expectedParams.length);
      for (let i = 0; i < expectedParams.length; i++) {
        testLiteralExpression(func.parameters[i], expectedParams[i]);
      }
    }
  });

  it("Can parse a call expression", () => {
    const input = "add(1,2 * 3, 4 + 5);";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(parser.errors).toHaveLength(0);
    expect(program.statements).toHaveLength(1);

    expect(program.statements[0]).toBeInstanceOf(AST.ExpressionStatement);
    const stmt = program.statements[0] as AST.ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(AST.CallExpression);
    const exp = stmt.expression as AST.CallExpression;

    testIdentifier(exp.function, "add");
    expect(exp.arguments).toHaveLength(3);

    testLiteralExpression(exp.arguments[0], 1);
    testInfixExpression(exp.arguments[1], 2, "*", 3);
    testInfixExpression(exp.arguments[2], 4, "+", 5);
  });
});
