"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Program = (function () {
    function Program() {
        this.statements = [];
    }
    Program.prototype.string = function () {
        return this.statements.map(function (x) { return x.string(); }).join("");
    };
    Program.prototype.tokenLiteral = function () {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        }
        else {
            return "";
        }
    };
    return Program;
}());
exports.Program = Program;
var Identifier = (function () {
    function Identifier(token, value) {
        this.token = token;
        this.value = value;
    }
    Identifier.prototype.string = function () {
        return this.value;
    };
    Identifier.prototype.expressionNode = function () { };
    Identifier.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    return Identifier;
}());
exports.Identifier = Identifier;
var LetStatement = (function () {
    function LetStatement(token) {
        this.token = token;
    }
    LetStatement.prototype.string = function () {
        return (this.tokenLiteral() +
            " " +
            this.name.string() +
            " = " +
            (this.value && this.value.string()) +
            ";");
    };
    LetStatement.prototype.statementNode = function () { };
    LetStatement.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    return LetStatement;
}());
exports.LetStatement = LetStatement;
var ReturnStatement = (function () {
    function ReturnStatement(token) {
        this.token = token;
    }
    ReturnStatement.prototype.string = function () {
        return (this.tokenLiteral() +
            (this.returnValue && this.returnValue.string()) +
            ";");
    };
    ReturnStatement.prototype.statementNode = function () { };
    ReturnStatement.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    return ReturnStatement;
}());
exports.ReturnStatement = ReturnStatement;
var ExpressionStatement = (function () {
    function ExpressionStatement(token) {
        this.token = token;
    }
    ExpressionStatement.prototype.string = function () {
        return this.expression ? this.expression.string() : "";
    };
    ExpressionStatement.prototype.statementNode = function () { };
    ExpressionStatement.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    return ExpressionStatement;
}());
exports.ExpressionStatement = ExpressionStatement;
var IntegerLiteral = (function () {
    function IntegerLiteral(token) {
        this.token = token;
    }
    IntegerLiteral.prototype.string = function () {
        return this.token.literal;
    };
    IntegerLiteral.prototype.expressionNode = function () { };
    IntegerLiteral.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    return IntegerLiteral;
}());
exports.IntegerLiteral = IntegerLiteral;
var PrefixExpression = (function () {
    function PrefixExpression(token, operator) {
        this.token = token;
        this.operator = operator;
    }
    PrefixExpression.prototype.expressionNode = function () { };
    PrefixExpression.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    PrefixExpression.prototype.string = function () {
        return "(" + this.operator + this.right.string() + ")";
    };
    return PrefixExpression;
}());
exports.PrefixExpression = PrefixExpression;
var InfixExpression = (function () {
    function InfixExpression(token, left, operator, right) {
        this.token = token;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    InfixExpression.prototype.expressionNode = function () { };
    InfixExpression.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    InfixExpression.prototype.string = function () {
        return ("(" +
            this.left.string() +
            (" " + this.operator + " ") +
            this.right.string() +
            ")");
    };
    return InfixExpression;
}());
exports.InfixExpression = InfixExpression;
var Boolean = (function () {
    function Boolean(token, value) {
        this.token = token;
        this.value = value;
    }
    Boolean.prototype.expressionNode = function () { };
    Boolean.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    Boolean.prototype.string = function () {
        return this.token.literal;
    };
    return Boolean;
}());
exports.Boolean = Boolean;
var IfExpression = (function () {
    function IfExpression() {
    }
    IfExpression.prototype.expressionNode = function () { };
    IfExpression.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    IfExpression.prototype.string = function () {
        var buf = "if" + this.condition.string() + " " + this.consequence.string();
        if (this.alternative) {
            buf += "else " + this.alternative.string();
        }
        return buf;
    };
    return IfExpression;
}());
exports.IfExpression = IfExpression;
var BlockStatement = (function () {
    function BlockStatement() {
        this.statements = [];
    }
    BlockStatement.prototype.statementNode = function () { };
    BlockStatement.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    BlockStatement.prototype.string = function () {
        var buf = "";
        for (var _i = 0, _a = this.statements; _i < _a.length; _i++) {
            var s = _a[_i];
            buf += s.string();
        }
        return buf;
    };
    return BlockStatement;
}());
exports.BlockStatement = BlockStatement;
var FunctionLiteral = (function () {
    function FunctionLiteral(token) {
        this.parameters = [];
        this.token = token;
    }
    FunctionLiteral.prototype.expressionNode = function () { };
    FunctionLiteral.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    FunctionLiteral.prototype.string = function () {
        var buf = "";
        buf += this.tokenLiteral();
        buf += "(";
        buf += this.parameters.map(function (x) { return x.string(); }).join(",");
        buf += ") ";
        buf += this.body.string();
        return buf;
    };
    return FunctionLiteral;
}());
exports.FunctionLiteral = FunctionLiteral;
var CallExpression = (function () {
    function CallExpression() {
    }
    CallExpression.prototype.expressionNode = function () { };
    CallExpression.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    CallExpression.prototype.string = function () {
        var buf = "";
        buf += this.function.string();
        buf += "(";
        buf += this.arguments.map(function (x) { return x.string(); }).join(",");
        buf += ")";
        return buf;
    };
    return CallExpression;
}());
exports.CallExpression = CallExpression;
//# sourceMappingURL=ast.js.map