const {RegexTokenizer, TokenizerChain, CustomTokenizer} = require("../dist");
const {expect} = require('chai');

describe("RegenTokenizer", () => {
    context("with HTML test", () => {
        it("should return the correct tokens.", () => {
            expect(new RegexTokenizer(/<.*?>/).tokenize("message<p>test</p>another message")).to.eql([
                {value: "message", isToken: false},
                {value: "<p>", isToken: true},
                {value: "test", isToken: false},
                {value: "</p>", isToken: true},
                {value: "another message", isToken: false}
            ]);
        });
    });
});

describe("TokenizerChain", () => {
    context("with HTML test", () => {
        it("should return the correct tokens", () => {
            expect(new TokenizerChain(new RegexTokenizer(/<.*?>/))
                .token(new CustomTokenizer(input => {
                    return [
                        {value: input.substring(1, input.length-1), isToken: true}
                    ];
                }), chain => {
                    chain.token(new CustomTokenizer(input => {
                        return [{value: input.startsWith("/") ? input.substring(1) : input, isToken: true, info: input.startsWith("/") ? "closing" : "opening"}];
                    }))
                })
                .run("message<p>test</p>another message")).to.eql(
                [
                    { value: 'message', isToken: false },
                    { value: 'p', isToken: true, info: 'opening' },
                    { value: 'test', isToken: false },
                    { value: 'p', isToken: true, info: 'closing' },
                    { value: 'another message', isToken: false }
                ]
            );
        });
    });
});