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
    <div style={{ backgroundColor: "#333333", height: "100vh" }}>
      <a
        href="https://github.com/Aedalus/cacti-script"
        style={{ position: "absolute", top: 0, right: 0 }}
      >
        <img
          width="149"
          height="149"
          src="https://github.blog/wp-content/uploads/2008/12/forkme_right_white_ffffff.png?resize=149%2C149"
          className="attachment-full size-full"
          alt="Fork me on GitHub"
          data-recalc-dims="1"
        ></img>
      </a>
      <h1
        style={{
          color: "white",
          fontFamily: "lobster",
          fontSize: "4em",
          paddingLeft: "20px",
          paddingTop: "20px"
        }}
      >
        Cacti Script
      </h1>
      <h3
        style={{
          color: "white",
          fontFamily: "lobster",
          paddingLeft: "20px",
          marginTop: "10px"
        }}
      >
        A light scripting language ready to run everywhere*
      </h3>

      <div className="App" style={{ display: "flex", padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <textarea
            style={{
              width: "400px",
              height: "500px",
              fontFamily: "monospace",
              backgroundColor: "#222222",
              color: "#DDDDDD"
            }}
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
                  setEvalResult(result.inspect());
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
          style={{
            width: "400px",
            height: "500px",
            marginLeft: "20px",
            backgroundColor: "#EEEEEE"
          }}
          value={evalResult}
        ></textarea>
      </div>
      <p style={{ color: "white", paddingLeft: "20px", fontFamily: "roboto" }}>
        *Please do not run Cacti Script anywhere, especially any staging or
        production environments.
      </p>
    </div>
  );
}

export default App;
