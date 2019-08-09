import * as AST from "./ast";
import { Token, TOKEN_TYPE } from "../token";
describe("ast", () => {
  it("Can print strings", () => {
    const program = new AST.Program();
    const letStatement = new AST.LetStatement({
      type: TOKEN_TYPE.LET,
      literal: "let"
    });
    letStatement.name = new AST.Identifier(
      { type: TOKEN_TYPE.IDENT, literal: "myVar" },
      "myVar"
    );
    letStatement.value = new AST.Identifier(
      {
        type: TOKEN_TYPE.IDENT,
        literal: "anotherVar"
      },
      "anotherVar"
    );
    program.statements.push(letStatement);

    expect(letStatement.string()).toEqual("let myVar = anotherVar;");
    expect(program.string()).toEqual("let myVar = anotherVar;");
  });
});
