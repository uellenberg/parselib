const {RegexTokenizer, TokenizerChain, CustomTokenizer, ParseExpression} = require("../dist");
const {expect} = require("chai");

describe("TokenizerChain", () => {
    context("with HTML test", () => {
        it("should return the correct tokens", () => {
            expect(new TokenizerChain(new RegexTokenizer(/<.*?>/g))
                .token(new CustomTokenizer(input => {
                    return [
                        {value: input.substring(1, input.length-1), isToken: true}
                    ];
                }), chain => {
                    chain.token(new CustomTokenizer(input => {
                        return [{value: input.startsWith("/") ? input.substring(1) : input, isToken: true, info: input.startsWith("/") ? "closing" : "opening"}];
                    }));
                })
                .text(new CustomTokenizer(input => {
                    return [
                        {value: input.replace(/message/g, "a message used to be here"), isToken: false}
                    ];
                }))
                .run("message<p>test</p>another message")).to.eql(
                [
                    { value: "a message used to be here", isToken: false },
                    { value: "p", isToken: true, info: "opening" },
                    { value: "test", isToken: false },
                    { value: "p", isToken: true, info: "closing" },
                    { value: "another a message used to be here", isToken: false }
                ]
            );
        });
    });
});

describe("Tokenizers", () => {
    describe("RegexTokenizer", () => {
        context("with HTML test", () => {
            it("should return the correct tokens.", () => {
                expect(new RegexTokenizer(/<.*?>/g).tokenize("message<p>test</p>another message")).to.eql([
                    {value: "message", isToken: false},
                    {value: "<p>", isToken: true},
                    {value: "test", isToken: false},
                    {value: "</p>", isToken: true},
                    {value: "another message", isToken: false}
                ]);
            });
        });
    });
})

describe("Parsers", () => {
    describe("ExpressionParser", () => {
        context("with ((182*(10^4))*((17*(192/4))-1))+2", () => {
            it("should return 1483300002", () => {
                expect(ParseExpression("((182*(10^4))*((17*(192/4))-1))+2")).to.eql(1483300002);
            });
        });
    });
});