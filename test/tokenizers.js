const {RegexTokenizer, TokenizerChain, CustomTokenizer, ParseExpression, ParseXML} = require("../dist");
const {expect} = require("chai");

describe("TokenizerChain", () => {
    context("with HTML test", () => {
        it("should return the correct tokens", () => {
            expect(new TokenizerChain(new RegexTokenizer(/<(".*?"|.*?)*?>/g))
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
                }), chain => {
                    chain.text(new RegexTokenizer(/message/g));
                })
                .run("message<p>test</p>another message")).to.eql(
                [
                    {value: "a ", isToken: false },
                    {value: "message", isToken: true},
                    {value: " used to be here", isToken: false},
                    {value: "p", isToken: true, info: "opening"},
                    {value: "test", isToken: false },
                    {value: "p", isToken: true, info: "closing"},
                    {value: "another a ", isToken: false},
                    {value: "message", isToken: true},
                    {value: " used to be here", isToken: false}
                ]
            );
        });
    });

    context("with no input in the constructor", () => {
        it("should throw an error.", () => {
            expect(() => new TokenizerChain()).to.throw("A tokenizer is required.");
        });
    });

    context("with no input in the add functions", () => {
        it("should throw an error.", () => {
            expect(() => new TokenizerChain(new RegexTokenizer(/a/g)).token()).to.throw("A tokenizer is required.");
            expect(() => new TokenizerChain(new RegexTokenizer(/a/g)).text()).to.throw("A tokenizer is required.");
        });
    });

    context("with no input in the tokenize function", () => {
        it("should throw an error", () => {
            expect(() => new TokenizerChain(new RegexTokenizer(/a/g)).run()).to.throw("An input is required.");
        });
    });
});

describe("Tokenizers", () => {
    describe("RegexTokenizer", () => {
        context("with a valid input", () => {
            it("should return the correct tokens.", () => {
                expect(new RegexTokenizer(/<(".*?"|.*?)*?>/g).tokenize("message<p>test</p>another message")).to.eql([
                    {value: "message", isToken: false},
                    {value: "<p>", isToken: true},
                    {value: "test", isToken: false},
                    {value: "</p>", isToken: true},
                    {value: "another message", isToken: false}
                ]);
            });
        });

        context("with no input in the constructor", () => {
            it("should throw an error.", () => {
                expect(() => new RegexTokenizer()).to.throw("A regular expression is required.");
            });
        });

        context("with a non-global regular expression in the constructor", () => {
            it("should throw an error.", () => {
                expect(() => new RegexTokenizer(/a/)).to.throw("The regular expression must have the global flag.");
            });
        });

        context("with no input in the tokenize function", () => {
            it("should throw an error", () => {
                expect(() => new RegexTokenizer(/a/g).tokenize()).to.throw("An input is required.");
            });
        });
    });

    describe("CustomTokenizer", () => {
        context("with a valid input", () => {
            it("should return the correct tokens.", () => {
                expect(new CustomTokenizer(input => input.split(" ").map(val => ({value: val, isToken: true}))).tokenize("this is a test sentence")).to.eql([
                    {value: "this", isToken: true},
                    {value: "is", isToken: true},
                    {value: "a", isToken: true},
                    {value: "test", isToken: true},
                    {value: "sentence", isToken: true}
                ]);
            });
        });

        context("with no input in the constructor", () => {
            it("should throw an error.", () => {
                expect(() => new CustomTokenizer()).to.throw("A callback is required.");
            });
        });

        context("with no input in the tokenize function", () => {
            it("should throw an error", () => {
                expect(() => new CustomTokenizer(input => input.split(" ").map(val => ({value: val, isToken: true}))).tokenize()).to.throw("An input is required.");
            });
        });
    });
})

describe("Parsers", () => {
    describe("ExpressionParser", () => {
        context("with a valid expression", () => {
            it("should return the correct value", () => {
                expect(ParseExpression("((182*(10^4))*((17*(192/4))-1))+2")).to.eql(1483300002);
            });
        });

        context("with no input", () => {
            it("should throw an error", () => {
                expect(ParseExpression.bind(ParseExpression)).to.throw("An input is required.");
            });
        });

        context("with invalid operators", () => {
            it("should throw an error.", () => {
                expect(ParseExpression.bind(ParseExpression, "1*")).to.throw("The input mathematical expression contains an operator without a number on both sides.");
                expect(ParseExpression.bind(ParseExpression, "*1")).to.throw("The input mathematical expression contains an operator without a number on both sides.");
                expect(ParseExpression.bind(ParseExpression, "1**1")).to.throw("The input mathematical expression contains an invalid operator.");
            });
        });

        context("with invalid parentheses", () => {
            it("should throw an error.", () => {
                expect(ParseExpression.bind(ParseExpression, "((1)")).to.throw("The input contains an invalid sequence.");
                expect(ParseExpression.bind(ParseExpression, ")(1)")).to.throw("The input contains an invalid sequence.");
                expect(ParseExpression.bind(ParseExpression, "(1)(")).to.throw("The input contains an invalid sequence.");
                expect(ParseExpression.bind(ParseExpression, "(1))")).to.throw("The input contains an invalid sequence.");
            });
        });
    });

    describe("XMLParser", () => {
        context("with a valid document", () => {
            it("should return the correct object", () => {
                expect(ParseXML(`
                 <?xml version="1.0" encoding="UTF-8"?>
                <movie id="1">
                    <title>Example Movie</title>
                    <released>
                        <year>1999</year>
                        <month>10</month>
                        <day>18</day>
                    </released>
                    <company>Example Company
                    with newlines</company>
                    <selfclosing type="tag" />
                </movie>
                `)).to.eql({attributes: {version: "1.0", encoding: "UTF-8"}, content: [
                    {name: "movie", attributes: {id: "1"}, content: [
                            {name: "title", attributes: {}, content: "Example Movie"},
                            {name: "released", attributes: {}, content: [
                                    {name: "year", attributes: {}, content: "1999"},
                                    {name: "month", attributes: {}, content: "10"},
                                    {name: "day", attributes: {}, content: "18"}
                                ]
                            },
                            {name: "company", attributes: {}, content: "Example Company\n                    with newlines"},
                            {name: "selfclosing", attributes: {type: "tag"}, content: null}
                        ]
                    }
                ]});
            });
        });

        context("with a document that has an invalid attribute", () => {
            it("should throw an error", () => {
                expect(ParseXML.bind(ParseXML, "<test invaldProperty></test>")).to.throw("An attribute must have a value.");
            });
        });

        context("with incorrectly closed tags", () => {
            it("should throw an error", () => {
                expect(ParseXML.bind(ParseXML, "<unescaped>")).to.throw("The input contains an invalid sequence.");
                expect(ParseXML.bind(ParseXML, "<unescaped></unescaped></unescaped>")).to.throw("The input contains an invalid sequence.");
                expect(ParseXML.bind(ParseXML, "</unescaped>")).to.throw("The input contains an invalid sequence.");
                expect(ParseXML.bind(ParseXML, "<unescaped></differenttag>")).to.throw("An XML tag must be closed by a tag of the same name.");
            });
        });

        context("with two attributes of the same name", () => {
            it("should throw an error", () => {
                expect(ParseXML.bind(ParseXML, "<incorrect attribute='something' attribute='something else'></incorrect>")).to.throw("An XML attribute cannot be defined twice.");
            });
        });

        context("with root-level text", () => {
            it("should throw an error", () => {
                expect(ParseXML.bind(ParseXML, "text")).to.throw("Text can only go inside of XML Entities.");
            });
        });

        context("with text alongside entities", () => {
            it("should throw an error", () => {
                expect(ParseXML.bind(ParseXML, "<test><tag></tag>text</test>")).to.throw("Strings cannot go alongside other XML Entities.");
            });
        });
    });
});