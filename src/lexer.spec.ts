import { Lexer } from "./lexer";
import { TOKEN_TYPE } from "./token";
describe("lexer", () => {
  it("can lex", () => {
    const input = `let five = 5;
let ten = 10;
    let add = fn(x, y) {
      x + y;
};
let result = add(five, ten);

10 == 10; 10 != 9;
"foobar"
"foo bar"
`;

    const l = new Lexer(input);
    while (true) {
      const token = l.nextToken();
      if (token.type === TOKEN_TYPE.EOF) break;
      else {
        // console.log(token);
      }
    }
  });
});
