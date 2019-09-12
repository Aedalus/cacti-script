import * as AST from "./ast/ast";
import * as Obj from "./obj";

// Don't need to recreate these each time
const TrueObj = new Obj.BooleanObj(true);
const FalseObj = new Obj.BooleanObj(false);
const NullObj = new Obj.NullObj();

export function evalNode(node: AST.Node): Obj.Obj {
  if (node instanceof AST.Program) {
    return evalProgram(node.statements);
  } else if (node instanceof AST.PrefixExpression) {
    const right = evalNode(node.right);
    return evalPrefixExpression(node.operator, right);
  } else if (node instanceof AST.ExpressionStatement) {
    return evalNode(node.expression);
  } else if (node instanceof AST.IntegerLiteral) {
    return new Obj.IntegerObj(node.value);
  } else if (node instanceof AST.InfixExpression) {
    const left = evalNode(node.left);
    const right = evalNode(node.right);
    return evalInfixExpression(node.operator, left, right);
  } else if (node instanceof AST.Boolean) {
    return node.value ? TrueObj : FalseObj;
  } else if (node instanceof AST.BlockStatement) {
    return evalBlockStatement(node);
  } else if (node instanceof AST.IfExpression) {
    return evalIfExpression(node);
  } else if (node instanceof AST.ReturnStatement) {
    const val = evalNode(node.returnValue);
    return new Obj.ReturnValue(val);
  } else {
    console.error("Node type not recognized");
    return null;
  }
}

export function evalBlockStatement(block: AST.BlockStatement) {
  let result: Obj.Obj;

  for (let stmt of block.statements) {
    result = evalNode(stmt);

    if (result instanceof Obj.ReturnValue) {
      return result;
    }
  }
  return result;
}

export function evalProgram(stmts: AST.Statement[]): Obj.Obj {
  let result: Obj.Obj | undefined;

  for (let stmt of stmts) {
    result = evalNode(stmt);
    if (result instanceof Obj.ReturnValue) {
      return result.value;
    }
  }

  return result;
}

export function evalIfExpression(ie: AST.IfExpression): Obj.Obj {
  const condition = evalNode(ie.condition);

  if (isTruthy(condition)) {
    return evalNode(ie.consequence);
  } else if (ie.alternative) {
    return evalNode(ie.alternative);
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

  return NullObj;
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
      return NullObj;
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
      return NullObj;
  }
}

export function evalMinusPrefixOperatorExpression(right: Obj.Obj): Obj.Obj {
  if (right instanceof Obj.IntegerObj === false) {
    return NullObj;
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
