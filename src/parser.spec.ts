import { Parser } from "./parser";
import { Lexer } from "./lexer";
import {
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  PrefixExpression
} from "./ast/ast";

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
});
