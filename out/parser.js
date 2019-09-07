"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var token_1 = require("./token");
var ast_1 = require("./ast/ast");
var PRECEDENCE;
(function (PRECEDENCE) {
    PRECEDENCE[PRECEDENCE["LOWEST"] = 0] = "LOWEST";
    PRECEDENCE[PRECEDENCE["EQUALS"] = 1] = "EQUALS";
    PRECEDENCE[PRECEDENCE["LESSGREATER"] = 2] = "LESSGREATER";
    PRECEDENCE[PRECEDENCE["SUM"] = 3] = "SUM";
    PRECEDENCE[PRECEDENCE["PRODUCT"] = 4] = "PRODUCT";
    PRECEDENCE[PRECEDENCE["PREFIX"] = 5] = "PREFIX";
    PRECEDENCE[PRECEDENCE["CALL"] = 6] = "CALL";
})(PRECEDENCE || (PRECEDENCE = {}));
var TOKEN_TYPE_PRECEDENCE = new Map();
TOKEN_TYPE_PRECEDENCE.set(token_1.TOKEN_TYPE.EQ, PRECEDENCE.EQUALS);
TOKEN_TYPE_PRECEDENCE.set(token_1.TOKEN_TYPE.NOT_EQ, PRECEDENCE.EQUALS);
TOKEN_TYPE_PRECEDENCE.set(token_1.TOKEN_TYPE.LT, PRECEDENCE.LESSGREATER);
TOKEN_TYPE_PRECEDENCE.set(token_1.TOKEN_TYPE.GT, PRECEDENCE.LESSGREATER);
TOKEN_TYPE_PRECEDENCE.set(token_1.TOKEN_TYPE.PLUS, PRECEDENCE.SUM);
TOKEN_TYPE_PRECEDENCE.set(token_1.TOKEN_TYPE.MINUS, PRECEDENCE.SUM);
TOKEN_TYPE_PRECEDENCE.set(token_1.TOKEN_TYPE.SLASH, PRECEDENCE.PRODUCT);
TOKEN_TYPE_PRECEDENCE.set(token_1.TOKEN_TYPE.ASTERISK, PRECEDENCE.PRODUCT);
TOKEN_TYPE_PRECEDENCE.set(token_1.TOKEN_TYPE.LPAREN, PRECEDENCE.CALL);
var Parser = (function () {
    function Parser(lexer) {
        this.errors = [];
        this.prefixParseFns = new Map();
        this.infixParseFns = new Map();
        this.lexer = lexer;
        this.nextToken();
        this.nextToken();
        this.registerPrefix(token_1.TOKEN_TYPE.TRUE, this.parseBoolean.bind(this));
        this.registerPrefix(token_1.TOKEN_TYPE.FALSE, this.parseBoolean.bind(this));
        this.registerPrefix(token_1.TOKEN_TYPE.IDENT, this.parseIdentifier.bind(this));
        this.registerPrefix(token_1.TOKEN_TYPE.INT, this.parseIntegerLiteral.bind(this));
        this.registerPrefix(token_1.TOKEN_TYPE.BANG, this.parsePrefixExpression.bind(this));
        this.registerPrefix(token_1.TOKEN_TYPE.MINUS, this.parsePrefixExpression.bind(this));
        this.registerPrefix(token_1.TOKEN_TYPE.LPAREN, this.parseGroupedExpression.bind(this));
        this.registerPrefix(token_1.TOKEN_TYPE.IF, this.parseIfExpression.bind(this));
        this.registerPrefix(token_1.TOKEN_TYPE.FUNCTION, this.parseFunctionLiteral.bind(this));
        this.registerInfix(token_1.TOKEN_TYPE.PLUS, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TOKEN_TYPE.MINUS, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TOKEN_TYPE.SLASH, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TOKEN_TYPE.ASTERISK, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TOKEN_TYPE.EQ, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TOKEN_TYPE.NOT_EQ, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TOKEN_TYPE.LT, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TOKEN_TYPE.GT, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TOKEN_TYPE.LPAREN, this.parseCallExpression.bind(this));
    }
    Parser.prototype.parseCallExpression = function (func) {
        var exp = new ast_1.CallExpression();
        exp.token = this.curToken;
        exp.function = func;
        exp.arguments = this.parseCallArguments();
        return exp;
    };
    Parser.prototype.parseCallArguments = function () {
        var args = [];
        if (this.peekTokenIs(token_1.TOKEN_TYPE.RPAREN)) {
            this.nextToken();
            return args;
        }
        this.nextToken();
        args.push(this.parseExpression(PRECEDENCE.LOWEST));
        while (this.peekTokenIs(token_1.TOKEN_TYPE.COMMA)) {
            this.nextToken();
            this.nextToken();
            args.push(this.parseExpression(PRECEDENCE.LOWEST));
        }
        if (!this.expectPeek(token_1.TOKEN_TYPE.RPAREN)) {
            return null;
        }
        return args;
    };
    Parser.prototype.parseFunctionLiteral = function () {
        var lit = new ast_1.FunctionLiteral(this.curToken);
        if (!this.expectPeek(token_1.TOKEN_TYPE.LPAREN))
            return null;
        lit.parameters = this.parseFunctionParameters();
        if (!this.expectPeek(token_1.TOKEN_TYPE.LBRACE))
            return null;
        lit.body = this.parseBlockStatement();
        return lit;
    };
    Parser.prototype.parseFunctionParameters = function () {
        var identifiers = [];
        if (this.peekTokenIs(token_1.TOKEN_TYPE.RPAREN)) {
            this.nextToken();
            return identifiers;
        }
        this.nextToken();
        var ident = new ast_1.Identifier(this.curToken, this.curToken.literal);
        identifiers.push(ident);
        while (this.peekTokenIs(token_1.TOKEN_TYPE.COMMA)) {
            this.nextToken();
            this.nextToken();
            var ident_1 = new ast_1.Identifier(this.curToken, this.curToken.literal);
            identifiers.push(ident_1);
        }
        if (!this.expectPeek(token_1.TOKEN_TYPE.RPAREN))
            return null;
        return identifiers;
    };
    Parser.prototype.parseIfExpression = function () {
        var expression = new ast_1.IfExpression();
        expression.token = this.curToken;
        if (!this.expectPeek(token_1.TOKEN_TYPE.LPAREN))
            return null;
        this.nextToken();
        expression.condition = this.parseExpression(PRECEDENCE.LOWEST);
        if (!this.expectPeek(token_1.TOKEN_TYPE.RPAREN))
            return null;
        if (!this.expectPeek(token_1.TOKEN_TYPE.LBRACE))
            return null;
        expression.consequence = this.parseBlockStatement();
        if (this.peekTokenIs(token_1.TOKEN_TYPE.ELSE)) {
            this.nextToken();
            if (!this.expectPeek(token_1.TOKEN_TYPE.LBRACE)) {
                return null;
            }
            expression.alternative = this.parseBlockStatement();
        }
        return expression;
    };
    Parser.prototype.parseBlockStatement = function () {
        var block = new ast_1.BlockStatement();
        this.nextToken();
        while (!this.curTokenIs(token_1.TOKEN_TYPE.RBRACE) &&
            !this.curTokenIs(token_1.TOKEN_TYPE.EOF)) {
            var stmt = this.parseStatement();
            if (stmt)
                block.statements.push(stmt);
            this.nextToken();
        }
        return block;
    };
    Parser.prototype.parseGroupedExpression = function () {
        this.nextToken();
        var exp = this.parseExpression(PRECEDENCE.LOWEST);
        if (!this.expectPeek(token_1.TOKEN_TYPE.RPAREN)) {
            return null;
        }
        return exp;
    };
    Parser.prototype.parseBoolean = function () {
        return new ast_1.Boolean(this.curToken, this.curTokenIs(token_1.TOKEN_TYPE.TRUE));
    };
    Parser.prototype.parseInfixExpression = function (left) {
        var token = this.curToken;
        var operator = this.curToken.literal;
        var precedence = this.curPrecendence();
        this.nextToken();
        var right = this.parseExpression(precedence);
        return new ast_1.InfixExpression(token, left, operator, right);
    };
    Parser.prototype.peekPrecendence = function () {
        if (TOKEN_TYPE_PRECEDENCE.has(this.peekToken.type))
            return TOKEN_TYPE_PRECEDENCE.get(this.peekToken.type);
        else
            return PRECEDENCE.LOWEST;
    };
    Parser.prototype.curPrecendence = function () {
        if (TOKEN_TYPE_PRECEDENCE.has(this.curToken.type))
            return TOKEN_TYPE_PRECEDENCE.get(this.curToken.type);
        else
            return PRECEDENCE.LOWEST;
    };
    Parser.prototype.parsePrefixExpression = function () {
        var expression = new ast_1.PrefixExpression(this.curToken, this.curToken.literal);
        this.nextToken();
        expression.right = this.parseExpression(PRECEDENCE.PREFIX);
        return expression;
    };
    Parser.prototype.parseIdentifier = function () {
        return new ast_1.Identifier(this.curToken, this.curToken.literal);
    };
    Parser.prototype.parseIntegerLiteral = function () {
        var lit = new ast_1.IntegerLiteral(this.curToken);
        try {
            var value = Number.parseInt(this.curToken.literal, 10);
            lit.value = value;
            return lit;
        }
        catch (err) {
            this.errors.push("Could not parse " + this.curToken.literal + " as integer");
        }
    };
    Parser.prototype.noPrefixParseFnError = function (tokenType) {
        this.errors.push("no prefix parse function for " + tokenType + " found");
    };
    Parser.prototype.getErrors = function () {
        return this.errors;
    };
    Parser.prototype.nextToken = function () {
        this.curToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    };
    Parser.prototype.registerPrefix = function (tokenType, fn) {
        this.prefixParseFns.set(tokenType, fn);
    };
    Parser.prototype.registerInfix = function (tokenType, fn) {
        this.infixParseFns.set(tokenType, fn);
    };
    Parser.prototype.parseProgram = function () {
        var program = new ast_1.Program();
        while (!this.curTokenIs(token_1.TOKEN_TYPE.EOF)) {
            var stmt = this.parseStatement();
            if (stmt)
                program.statements.push(stmt);
            this.nextToken();
        }
        return program;
    };
    Parser.prototype.parseStatement = function () {
        switch (this.curToken.type) {
            case token_1.TOKEN_TYPE.LET:
                return this.parseLetStatement();
            case token_1.TOKEN_TYPE.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    };
    Parser.prototype.parseExpressionStatement = function () {
        var statement = new ast_1.ExpressionStatement(this.curToken);
        statement.expression = this.parseExpression(PRECEDENCE.LOWEST);
        if (this.peekTokenIs(token_1.TOKEN_TYPE.SEMICOLON)) {
            this.nextToken();
        }
        return statement;
    };
    Parser.prototype.parseExpression = function (precedence) {
        var prefix = this.prefixParseFns.get(this.curToken.type);
        if (!prefix) {
            this.noPrefixParseFnError(this.curToken.type);
            return undefined;
        }
        var leftExp = prefix();
        while (this.peekTokenIs(token_1.TOKEN_TYPE.SEMICOLON) === false &&
            precedence < this.peekPrecendence()) {
            var infix = this.infixParseFns.get(this.peekToken.type);
            if (!infix)
                return leftExp;
            this.nextToken();
            leftExp = infix(leftExp);
        }
        return leftExp;
    };
    Parser.prototype.parseLetStatement = function () {
        var stmt = new ast_1.LetStatement(this.curToken);
        if (!this.expectPeek(token_1.TOKEN_TYPE.IDENT)) {
            return null;
        }
        stmt.name = new ast_1.Identifier(this.curToken, this.curToken.literal);
        if (!this.expectPeek(token_1.TOKEN_TYPE.ASSIGN)) {
            return null;
        }
        this.nextToken();
        stmt.value = this.parseExpression(PRECEDENCE.LOWEST);
        if (this.peekTokenIs(token_1.TOKEN_TYPE.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    };
    Parser.prototype.parseReturnStatement = function () {
        var stmt = new ast_1.ReturnStatement(this.curToken);
        this.nextToken();
        stmt.returnValue = this.parseExpression(PRECEDENCE.LOWEST);
        if (this.peekTokenIs(token_1.TOKEN_TYPE.SEMICOLON)) {
            this.nextToken;
        }
        return stmt;
    };
    Parser.prototype.curTokenIs = function (token) {
        return this.curToken.type === token;
    };
    Parser.prototype.peekTokenIs = function (token) {
        return this.peekToken.type === token;
    };
    Parser.prototype.expectPeek = function (token) {
        if (this.peekTokenIs(token)) {
            this.nextToken();
            return true;
        }
        else {
            this.peekError(token);
            return false;
        }
    };
    Parser.prototype.peekError = function (token) {
        this.errors.push("expected next token to be " + token + ", got " + this.peekToken.type + " instead");
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map