import * as AST from "./ast/ast";
import { Environment } from "./environment";

enum OBJECT_TYPE {
  INTEGER_OBJ = "INTEGER",
  BOOLEAN_OBJ = "BOOLEAN",
  NULL_OBJ = "NULL",
  RETURN_VALUE_OBJ = "RETURN_VALUE",
  ERROR_OBJ = "ERROR",
  FUNCTION_OBJ = "FUNCTION",
  STRING_OBJ = "STRING"
}

export interface Obj {
  type(): OBJECT_TYPE;
  inspect(): string;
}

export class IntegerObj implements Obj {
  value: number;

  constructor(value: number) {
    this.value = value;
  }
  type() {
    return OBJECT_TYPE.INTEGER_OBJ;
  }
  inspect() {
    return this.value.toString();
  }
}

export class BooleanObj implements Obj {
  value: boolean;
  constructor(value: boolean) {
    this.value = value;
  }
  type() {
    return OBJECT_TYPE.BOOLEAN_OBJ;
  }
  inspect() {
    return this.value ? "true" : "false";
  }
}

export class NullObj implements Obj {
  type() {
    return OBJECT_TYPE.NULL_OBJ;
  }
  inspect() {
    return "null";
  }
}

export class ReturnValue implements Obj {
  value: Obj;

  constructor(value: Obj) {
    this.value = value;
  }
  type() {
    return OBJECT_TYPE.RETURN_VALUE_OBJ;
  }
  inspect() {
    return this.value.inspect();
  }
}

export class ErrorObj implements Obj {
  message: string;

  constructor(message: string) {
    this.message = message;
  }

  type() {
    return OBJECT_TYPE.ERROR_OBJ;
  }

  inspect(): string {
    return "ERROR: " + this.message;
  }
}

export class FunctionObj implements Obj {
  parameters: AST.Identifier[];
  body: AST.BlockStatement;
  env: Environment;

  constructor(
    parameters: AST.Identifier[],
    body: AST.BlockStatement,
    env: Environment
  ) {
    this.parameters = parameters;
    this.body = body;
    this.env = env;
  }

  type() {
    return OBJECT_TYPE.FUNCTION_OBJ;
  }

  inspect(): string {
    let str = "";

    str += "fn(";
    str += this.parameters.map(x => x.string()).join(",");
    str += ") {\n";
    str += this.body.string();
    str += "\n}";
    throw new Error("Method not implemented.");
  }
}

export class StringObj implements Obj {
  value: string;

  constructor(value: string) {
    this.value = value;
  }
  type() {
    return OBJECT_TYPE.STRING_OBJ;
  }
  inspect(): string {
    return this.value;
  }
}
