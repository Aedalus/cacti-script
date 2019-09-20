import * as AST from "./ast/ast";
import * as Obj from "./obj";
import { Environment } from "./environment";
// Don't need to recreate these each time
const TrueObj = new Obj.BooleanObj(true);
const FalseObj = new Obj.BooleanObj(false);
const NullObj = new Obj.NullObj();

function isError(obj: Obj.Obj) {
  if (obj) return obj instanceof Obj.ErrorObj;
  return false;
}

export function evalNode(node: AST.Node, env: Environment): Obj.Obj {
  if (node instanceof AST.Program) {
    return evalProgram(node.statements, env);
  } else if (node instanceof AST.PrefixExpression) {
    const right = evalNode(node.right, env);
    return isError(right) ? right : evalPrefixExpression(node.operator, right);
  } else if (node instanceof AST.StringLiteral) {
    return new Obj.StringObj(node.value);
  } else if (node instanceof AST.ExpressionStatement) {
    return evalNode(node.expression, env);
  } else if (node instanceof AST.IntegerLiteral) {
    return new Obj.IntegerObj(node.value);
  } else if (node instanceof AST.InfixExpression) {
    const left = evalNode(node.left, env);
    if (isError(left)) return left;
    const right = evalNode(node.right, env);
    if (isError(right)) return right;
    return evalInfixExpression(node.operator, left, right);
  } else if (node instanceof AST.Boolean) {
    return node.value ? TrueObj : FalseObj;
  } else if (node instanceof AST.BlockStatement) {
    return evalBlockStatement(node, env);
  } else if (node instanceof AST.IfExpression) {
    return evalIfExpression(node, env);
  } else if (node instanceof AST.ReturnStatement) {
    const val = evalNode(node.returnValue, env);
    return isError(val) ? val : new Obj.ReturnValue(val);
  } else if (node instanceof AST.LetStatement) {
    const val = evalNode(node.value, env);
    if (isError(val)) return val;
    env.set(node.name.value, val);
  } else if (node instanceof AST.Identifier) {
    return evalIdentifier(node, env);
  } else if (node instanceof AST.FunctionLiteral) {
    const params = node.parameters;
    const body = node.body;
    return new Obj.FunctionObj(params, body, env);
  } else if (node instanceof AST.CallExpression) {
    const func = evalNode(node.function, env);
    if (isError(func)) return func;
    const args = evalExpressions(node.arguments, env);
    if (args.length === 1 && isError(args[0])) {
      return args[0];
    }
    return applyFunction(func, args);
  } else {
    console.error("Node type not recognized");
    return null;
  }
}

export function applyFunction(func: Obj.Obj, args: Obj.Obj[]) {
  if (func instanceof Obj.FunctionObj === false)
    throw new Error(`not a function: ${func.type}`);

  const fn = func as Obj.FunctionObj;
  const extendedEnv = extendFunctionEnv(fn, args);
  const evaluated = evalNode(fn.body, extendedEnv);
  return unwrapReturnValue(evaluated);
}

export function extendFunctionEnv(
  fn: Obj.FunctionObj,
  args: Obj.Obj[]
): Environment {
  const env = Environment.newEnclosedEnvironment(fn.env);
  fn.parameters.forEach((p, i) => {
    env.set(p.value, args[i]);
  });
  return env;
}

export function unwrapReturnValue(obj: Obj.Obj): Obj.Obj {
  if (obj instanceof Obj.ReturnValue) return obj.value;
  return obj;
}

export function evalExpressions(
  exps: AST.Expression[],
  env: Environment
): Obj.Obj[] {
  const result: Obj.Obj[] = [];
  for (let e of exps) {
    const evaluated = evalNode(e, env);
    if (isError(evaluated)) {
      return [evaluated];
    } else {
      result.push(evaluated);
    }
  }
  return result;
}

export function evalIdentifier(
  node: AST.Identifier,
  env: Environment
): Obj.Obj {
  const val = env.get(node.value);
  return val ? val : new Obj.ErrorObj(`identifier not found: ${node.value}`);
}

export function evalBlockStatement(
  block: AST.BlockStatement,
  env: Environment
) {
  let result: Obj.Obj;

  for (let stmt of block.statements) {
    result = evalNode(stmt, env);

    if (result instanceof Obj.ReturnValue) {
      return result;
    } else if (result instanceof Obj.ErrorObj) {
      return result;
    }
  }
  return result;
}

export function evalProgram(stmts: AST.Statement[], env: Environment): Obj.Obj {
  let result: Obj.Obj | undefined;

  for (let stmt of stmts) {
    result = evalNode(stmt, env);
    if (result instanceof Obj.ReturnValue) {
      return result.value;
    } else if (result instanceof Obj.ErrorObj) {
      return result;
    }
  }

  return result;
}

export function evalIfExpression(
  ie: AST.IfExpression,
  env: Environment
): Obj.Obj {
  const condition = evalNode(ie.condition, env);
  if (isError(condition)) return condition;

  if (isTruthy(condition)) {
    return evalNode(ie.consequence, env);
  } else if (ie.alternative) {
    return evalNode(ie.alternative, env);
  } else {
    return NullObj;
  }
}

export function isTruthy(obj: Obj.Obj) {
  if (obj instanceof Obj.BooleanObj) return obj.value;
  if (obj instanceof Obj.NullObj) return false;
  return true;
}
export function evalInfixExpression(
  operator: string,
  left: Obj.Obj,
  right: Obj.Obj
): Obj.Obj {
  if (left instanceof Obj.IntegerObj && right instanceof Obj.IntegerObj) {
    return evalIntegerInfixExpression(operator, left, right);
  }

  // Boolean infix expressions
  if (operator === "==") {
    return nativeBoolToBooleanObj(left === right);
  } else if (operator === "!=") {
    return nativeBoolToBooleanObj(left !== right);
  }

  // Errors
  if (left.type() !== right.type()) {
    return new Obj.ErrorObj(
      `type mismatch: ${left.type()} ${operator} ${right.type()}`
    );
  } else {
    return new Obj.ErrorObj(
      `unknown operator: ${left.type()} ${operator} ${right.type()}`
    );
  }
}

export function nativeBoolToBooleanObj(bool: boolean) {
  return bool ? TrueObj : FalseObj;
}

export function evalIntegerInfixExpression(
  operator: string,
  left: Obj.IntegerObj,
  right: Obj.IntegerObj
): Obj.Obj {
  switch (operator) {
    case "+":
      return new Obj.IntegerObj(left.value + right.value);
    case "-":
      return new Obj.IntegerObj(left.value - right.value);
    case "*":
      return new Obj.IntegerObj(left.value * right.value);
    case "/":
      return new Obj.IntegerObj(Math.floor(left.value / right.value));
    case "<":
      return nativeBoolToBooleanObj(left.value < right.value);
    case ">":
      return nativeBoolToBooleanObj(left.value > right.value);
    case "==":
      return nativeBoolToBooleanObj(left.value === right.value);
    case "!=":
      return nativeBoolToBooleanObj(left.value !== right.value);
    default:
      return new Obj.ErrorObj(
        `unknown operator: ${left.type()} ${operator} ${right.type}`
      );
  }
}

export function evalPrefixExpression(
  operator: string,
  right: Obj.Obj
): Obj.Obj {
  switch (operator) {
    case "!":
      return evalBangOperatorExpression(right);
    case "-":
      return evalMinusPrefixOperatorExpression(right);
    default:
      return new Obj.ErrorObj(`unknown operator: ${operator}, ${right.type()}`);
  }
}

export function evalMinusPrefixOperatorExpression(right: Obj.Obj): Obj.Obj {
  if (right instanceof Obj.IntegerObj === false) {
    return new Obj.ErrorObj(`unknown operator: -${right.type()}`);
  } else {
    const intObj = right as Obj.IntegerObj;
    const value = intObj.value;
    return new Obj.IntegerObj(-value);
  }
}

export function evalBangOperatorExpression(right: Obj.Obj): Obj.Obj {
  if (right === TrueObj) return FalseObj;
  else if (right === FalseObj) return TrueObj;
  else if (right === NullObj) return TrueObj;
  else return FalseObj;
}
