"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TOKEN_TYPE;
(function (TOKEN_TYPE) {
    TOKEN_TYPE["ILLEGAL"] = "ILLEGAL";
    TOKEN_TYPE["EOF"] = "EOF";
    TOKEN_TYPE["IDENT"] = "IDENT";
    TOKEN_TYPE["INT"] = "INT";
    TOKEN_TYPE["COMMA"] = ",";
    TOKEN_TYPE["SEMICOLON"] = ";";
    TOKEN_TYPE["LPAREN"] = "(";
    TOKEN_TYPE["RPAREN"] = ")";
    TOKEN_TYPE["LBRACE"] = "{";
    TOKEN_TYPE["RBRACE"] = "}";
    TOKEN_TYPE["EQ"] = "==";
    TOKEN_TYPE["NOT_EQ"] = "!=";
    TOKEN_TYPE["ASSIGN"] = "=";
    TOKEN_TYPE["PLUS"] = "+";
    TOKEN_TYPE["MINUS"] = "-";
    TOKEN_TYPE["BANG"] = "!";
    TOKEN_TYPE["ASTERISK"] = "*";
    TOKEN_TYPE["SLASH"] = "/";
    TOKEN_TYPE["LT"] = "<";
    TOKEN_TYPE["GT"] = ">";
    TOKEN_TYPE["FUNCTION"] = "FUNCTION";
    TOKEN_TYPE["LET"] = "LET";
    TOKEN_TYPE["TRUE"] = "TRUE";
    TOKEN_TYPE["FALSE"] = "FALSE";
    TOKEN_TYPE["IF"] = "IF";
    TOKEN_TYPE["ELSE"] = "ELSE";
    TOKEN_TYPE["RETURN"] = "RETURN";
})(TOKEN_TYPE = exports.TOKEN_TYPE || (exports.TOKEN_TYPE = {}));
var keywords = {
    fn: TOKEN_TYPE.FUNCTION,
    let: TOKEN_TYPE.LET,
    true: TOKEN_TYPE.TRUE,
    false: TOKEN_TYPE.FALSE,
    if: TOKEN_TYPE.IF,
    else: TOKEN_TYPE.ELSE,
    return: TOKEN_TYPE.RETURN
};
function lookupIdent(ident) {
    return keywords[ident] || TOKEN_TYPE.IDENT;
}
exports.lookupIdent = lookupIdent;
//# sourceMappingURL=token.js.map