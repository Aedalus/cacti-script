import React, { useState } from "react";
import "./App.css";

import { Lexer, Parser, evalNode, Environment } from "cacti-script";

const defaultProgram = `let sum = fn (a,b) { a + b; };
let c = sum(5,5);
return c;`.trim();
function App() {
  const [input, setInput] = useState(defaultProgram);
  const [evalResult, setEvalResult] = useState("");

  return (
    <div className="App" style={{ display: "flex" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <textarea
          style={{ width: "400px", height: "500px" }}
          value={input}
          onChange={e => {
            setInput(e.target.value);
          }}
        ></textarea>
        <button
          onClick={() => {
            const l = new Lexer(input);
            const p = new Parser(l);
            const program = p.parseProgram();
            if (p.errors.length) {
              setEvalResult(JSON.stringify({ errors: p.errors }, null, 2));
            } else {
              const result = evalNode(program, new Environment());
              if (result) {
                setEvalResult(result.inpect());
              } else {
                setEvalResult("<no result>");
              }
            }
          }}
        >
          Run
        </button>
      </div>

      <textarea
        style={{ width: "400px", height: "500px" }}
        value={evalResult}
      ></textarea>
    </div>
  );
}

export default App;
