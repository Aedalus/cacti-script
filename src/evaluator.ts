import * as AST from "./ast/ast";
import * as Obj from "./obj";

// Don't need to recreate these each time
const TrueObj = new Obj.BooleanObj(true);
const FalseObj = new Obj.BooleanObj(false);
const NullObj = new Obj.NullObj();

export function evalNode(node: AST.Node): Obj.Obj {
  if (node instanceof AST.Program) {
    return evalStatements(node.statements);
  } else if (node instanceof AST.PrefixExpression) {
    const right = evalNode(node.right);
    return evalPrefixExpression(node.operator, right);
  } else if (node instanceof AST.ExpressionStatement) {
    return evalNode(node.expression);
  } else if (node instanceof AST.IntegerLiteral) {
    return new Obj.IntegerObj(node.value);
  } else if (node instanceof AST.Boolean) {
    return node.value ? TrueObj : FalseObj;
  } else {
    console.error("Node type not recognized");
    return null;
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

export function evalStatements(stmts: AST.Statement[]): Obj.Obj {
  let result: Obj.Obj | undefined = undefined;

  for (let s of stmts) {
    result = evalNode(s);
  }

  return result;
}
