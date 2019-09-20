import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { evalNode } from "./evaluator";
import * as Obj from "./obj";
import { Environment } from "./environment";

function testEval(input: string): Obj.Obj {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  const env = new Environment();
  return evalNode(program, env);
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
      { input: "-10;", expected: -10 },
      { input: "5 + 5 + 5 + 5 - 10;", expected: 10 },
      { input: "2 * 2 * 2 * 2 * 2;", expected: 32 },
      { input: "-50 + 100 + -50;", expected: 0 },
      { input: "5 * 2 + 10;", expected: 20 },
      { input: "5 + 2 * 10;", expected: 25 },
      { input: "20 + 2 * -10;", expected: 0 },
      { input: "50 / 2 * 2 + 10;", expected: 60 },
      { input: "2 * (5 + 10);", expected: 30 },
      { input: "3 * 3 * 3 + 10;", expected: 37 },
      { input: "3 * (3 * 3) + 10;", expected: 37 },
      { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10;", expected: 50 }
    ];
    for (let { input, expected } of tests) {
      const evaluated = testEval(input);
      testIntegerObject(evaluated, expected);
    }
  });

  it("Can eval a boolean expression", () => {
    const tests = [
      { input: "true;", expected: true },
      { input: "false;", expected: false },
      { input: "1 < 2;", expected: true },
      { input: "1 > 2;", expected: false },
      { input: "1 < 1;", expected: false },
      { input: "1 > 1;", expected: false },
      { input: "1 == 1;", expected: true },
      { input: "1 != 1;", expected: false },
      { input: "1 == 2;", expected: false },
      { input: "1 != 2;", expected: true },
      { input: "true == true;", expected: true },
      { input: "false == false;", expected: true },
      { input: "true == false;", expected: false },
      { input: "true != false;", expected: true },
      { input: "false != true;", expected: true },
      { input: "(1 < 2) == true;", expected: true },
      { input: "(1 < 2) == false;", expected: false },
      { input: "(1 > 2) == true;", expected: false },
      { input: "(1 > 2) == false;", expected: true }
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

  it("Can eval if/else expressions", () => {
    const tests = [
      { input: "if (true) { 10 }", expected: 10 },
      { input: "if (false) { 10 }", expected: null },
      { input: "if (1) { 10 }", expected: 10 },
      { input: "if (1 < 2) { 10 }", expected: 10 },
      { input: "if (1 > 2) { 10 }", expected: null },
      { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
      { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 }
    ];

    for (let { input, expected } of tests) {
      const evaluated = testEval(input);
      if (expected !== null) {
        expect(evaluated).toBeInstanceOf(Obj.IntegerObj);
        const intExp = evaluated as Obj.IntegerObj;
        expect(intExp.value).toEqual(expected);
      } else {
        expect(evaluated).toBeInstanceOf(Obj.NullObj);
      }
    }
  });

  it("Can evaluated return statements", () => {
    const tests = [
      { input: "return 10;", expected: 10 },
      { input: "return 10; 9;", expected: 10 },
      { input: "return 2 * 5; 9;", expected: 10 },
      { input: "9; return 2 * 5; 9;", expected: 10 },
      {
        input: `
        if(10 > 1) {
          if(10 > 1) {
            return 10;
          }
          return 1;
        }
      `,
        expected: 10
      }
    ];

    for (let { input, expected } of tests) {
      const evaluated = testEval(input);
      testIntegerObject(evaluated, expected);
    }
  });

  it("Can recognize an error", () => {
    const tests = [
      { input: "5 + true;", expected: "type mismatch: INTEGER + BOOLEAN" },
      { input: "5 + true; 5;", expected: "type mismatch: INTEGER + BOOLEAN" },
      { input: "-true;", expected: "unknown operator: -BOOLEAN" },
      {
        input: "true + false;",
        expected: "unknown operator: BOOLEAN + BOOLEAN"
      },
      {
        input: "5; true + false; 5;",
        expected: "unknown operator: BOOLEAN + BOOLEAN"
      },
      {
        input: "if (10 > 1) { true + false; }",
        expected: "unknown operator: BOOLEAN + BOOLEAN"
      },
      {
        input: `
        if(10 > 1){
          if(10 > 1){
            return true + false
          }
        }`,
        expected: "unknown operator: BOOLEAN + BOOLEAN"
      },
      { input: "foobar;", expected: "identifier not found: foobar" },
      {
        input: `"Hello" - "World";`,
        expected: "unknown operator: STRING - STRING"
      }
    ];

    for (let { input, expected } of tests) {
      const evaluated = testEval(input);
      expect(evaluated).toBeInstanceOf(Obj.ErrorObj);
      const err = evaluated as Obj.ErrorObj;
      expect(err.message).toEqual(expected);
    }
  });

  it("Can evaluate let statements", () => {
    const tests = [
      { input: "let a = 5; a;", expected: 5 },
      { input: "let a = 5 * 5; a;", expected: 25 },
      { input: "let a = 5; let b = a; b;", expected: 5 },
      { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 }
    ];

    for (let { input, expected } of tests) {
      testIntegerObject(testEval(input), expected);
    }
  });

  it("Can recognize functions", () => {
    const input = "fn(x){ x + 2; };";
    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(Obj.FunctionObj);
    const funcObj = evaluated as Obj.FunctionObj;

    expect(funcObj.parameters).toHaveLength(1);
    expect(funcObj.parameters[0].string()).toEqual("x");
    expect(funcObj.body.string()).toEqual("(x + 2)");
  });

  it("Can recognize more functions", () => {
    const tests = [
      { input: "let identity = fn(x) { x; }; identity(5);", expected: 5 },
      {
        input: "let identity = fn(x) { return x; }; identity(5);",
        expected: 5
      },
      {
        input: "let double = fn(x) { return x * 2; }; double(5);",
        expected: 10
      },
      { input: "let add = fn(x,y) { return x + y; }; add(5,5);", expected: 10 },
      {
        input: "let add = fn(x,y) { return x + y; }; add(5 + 5, add(5,5));",
        expected: 20
      },
      { input: "fn(x){ x; }(5)", expected: 5 }
    ];

    for (let { input, expected } of tests) {
      testIntegerObject(testEval(input), expected);
    }
  });

  it("Can recognize function closues", () => {
    const input = `
    let newAdder = fn(x) {
      fn(y) { x + y };
    };
    
    let addTwo = newAdder(2);
    addTwo(2);`;
    testIntegerObject(testEval(input), 4);
  });

  it("Can recognize string literals", () => {
    const input = `"Hello World!"`;
    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(Obj.StringObj);
    const str = evaluated as Obj.StringObj;
    expect(str.value).toEqual("Hello World!");
  });

  it("Can perform string concatenation", () => {
    const input = '"Hello" + " " + "World!"';
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(Obj.StringObj);
    const str = evaluated as Obj.StringObj;

    expect(str.value).toEqual("Hello World!");
  });
});
