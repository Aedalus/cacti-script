import { Parser } from "./parser";
import { Lexer } from "./lexer";
import {
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
  Expression
} from "./ast/ast";

function testIntegerLiteral(exp: Expression, value: number) {
  if (exp instanceof IntegerLiteral == false)
    throw new Error("Expression should be an IntegerLiteral");
  const cast = exp as IntegerLiteral;

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
    expect(program.statements[0]).toBeInstanceOf(LetStatement);
    expect(program.statements[1]).toBeInstanceOf(LetStatement);
    expect(program.statements[2]).toBeInstanceOf(LetStatement);

    expect(program.statements[0].tokenLiteral()).toEqual("let");
    expect(program.statements[1].tokenLiteral()).toEqual("let");
    expect(program.statements[2].tokenLiteral()).toEqual("let");
  });

  it("Can parse a return statement", () => {
    const input = `
    return 5;
    return 10;
    return 993322;
    `;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(parser.errors).toHaveLength(0);

    expect(program.statements).toHaveLength(3);

    expect(program.statements[0]).toBeInstanceOf(ReturnStatement);
    expect(program.statements[1]).toBeInstanceOf(ReturnStatement);
    expect(program.statements[2]).toBeInstanceOf(ReturnStatement);

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
    const stmt = program.statements[0] as ExpressionStatement;
    const ident = stmt.expression as Identifier;
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

    const stmt = program.statements[0] as ExpressionStatement;
    const literal = stmt.expression as IntegerLiteral;
    expect(literal.value).toEqual(5);
    expect(literal.tokenLiteral()).toEqual("5");
  });

  it("Can detect prefix expressions", () => {
    const tests = [
      {
        input: "!5;",
        operator: "!",
        value: 5
      },
      {
        input: "-15;",
        operator: "-",
        value: 15
      }
    ];
    for (let { input, operator, value } of tests) {
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      expect(p.errors).toHaveLength(0);

      expect(program.statements).toHaveLength(1);
      const stmt = program.statements[0] as ExpressionStatement;
      const exp = stmt.expression as PrefixExpression;
      expect(exp.operator).toEqual(operator);

      expect(exp.right).toBeInstanceOf(IntegerLiteral);
      expect((exp.right as IntegerLiteral).value).toEqual(value);
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

      expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
      const statement = program.statements[0] as ExpressionStatement;

      expect(statement.expression).toBeInstanceOf(InfixExpression);
      const exp = statement.expression as InfixExpression;

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

    assertProgramString("-a * b;", "((-a) * b)");
    assertProgramString("!-a;", "(!(-a))");
    assertProgramString("a + b + c;", "((a + b) + c)");
    assertProgramString("a + b - c;", "((a + b) - c)");
    assertProgramString("a * b * c;", "((a * b) * c)");
    assertProgramString("a * b / c;", "((a * b) / c)");
    assertProgramString("a + b / c;", "(a + (b / c))");
    assertProgramString(
      "a + b * c + d / e - f;",
      "(((a + (b * c)) + (d / e)) - f)"
    );
    assertProgramString("3 + 4; -5 * 5;", "(3 + 4)((-5) * 5)");
    assertProgramString("5 > 4 == 3 < 4;", "((5 > 4) == (3 < 4))");
    assertProgramString("5 < 4 != 3 > 4;", "((5 < 4) != (3 > 4))");
    assertProgramString(
      "3 + 4 * 5 == 3 * 1 + 4 * 5;",
      "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))"
    );
  });
});
