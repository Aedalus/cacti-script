import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { evalNode } from "./evaluator";
import * as Obj from "./obj";

function testEval(input: string): Obj.Obj {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();

  return evalNode(program);
}

function testIntegerObject(obj: Obj.Obj, expected: number) {
  if (obj instanceof Obj.IntegerObj === false) {
    console.error(obj);
    throw new Error("Obj is not an IntegerObj");
  }
  const result = obj as Obj.IntegerObj;
  if (result.value !== expected) {
    throw new Error(`${result.value} did not match ${expected}`);
  }
}

function testBooleanObject(obj: Obj.Obj, expected: boolean) {
  if (obj instanceof Obj.BooleanObj === false) {
    console.error(obj);
    throw new Error("Obj is not a BooleanObj");
  }
  const bool = obj as Obj.BooleanObj;
  if (bool.value !== expected) {
    throw new Error(`${bool.value} did not match ${expected}`);
  }
}

describe("evaluator", () => {
  it("Can eval an integer expression", () => {
    const tests = [
      { input: "5;", expected: 5 },
      { input: "10;", expected: 10 },
      { input: "20;", expected: 20 },
      { input: "-5;", expected: -5 },
      { input: "-10;", expected: -10 }
    ];
    for (let { input, expected } of tests) {
      const evaluated = testEval(input);
      testIntegerObject(evaluated, expected);
    }
  });

  it("Can eval a boolean expression", () => {
    const tests = [
      { input: "true;", expected: true },
      { input: "false;", expected: false }
    ];

    for (let { input, expected } of tests) {
      const evaluated = testEval(input);
      testBooleanObject(evaluated, expected);
    }
  });

  it("Can eval the ! operator", () => {
    const tests = [
      { input: "!true;", expected: false },
      { input: "!false;", expected: true },
      { input: "!5;", expected: false },
      { input: "!!true;", expected: true },
      { input: "!!false;", expected: false },
      { input: "!!5;", expected: true }
    ];

    for (let { input, expected } of tests) {
      const evaluated = testEval(input);
      testBooleanObject(evaluated, expected);
    }
  });
});
