// Tokens
// Make into an enum
export enum TOKEN_TYPE {
  ILLEGAL = "ILLEGAL",
  EOF = "EOF",
  IDENT = "IDENT",
  INT = "INT",
  COMMA = ",",
  SEMICOLON = ";",
  LPAREN = "(",
  RPAREN = ")",
  LBRACE = "{",
  RBRACE = "}",
  EQ = "==",
  NOT_EQ = "!=",

  // Operators
  ASSIGN = "=",
  PLUS = "+",
  MINUS = "-",
  BANG = "!",
  ASTERISK = "*",
  SLASH = "/",
  LT = "<",
  GT = ">",

  // Keywords
  FUNCTION = "FUNCTION",
  LET = "LET",
  TRUE = "TRUE",
  FALSE = "FALSE",
  IF = "IF",
  ELSE = "ELSE",
  RETURN = "RETURN"
}

export interface Token {
  type: TOKEN_TYPE;
  literal: string;
}

const keywords: { [index: string]: TOKEN_TYPE } = {
  fn: TOKEN_TYPE.FUNCTION,
  let: TOKEN_TYPE.LET,
  true: TOKEN_TYPE.TRUE,
  false: TOKEN_TYPE.FALSE,
  if: TOKEN_TYPE.IF,
  else: TOKEN_TYPE.ELSE,
  return: TOKEN_TYPE.RETURN
};

export function lookupIdent(ident: string): TOKEN_TYPE {
  return keywords[ident] || TOKEN_TYPE.IDENT;
}
