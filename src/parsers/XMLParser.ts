import {TokenizerChain} from "../tokenizerChain";
import {CustomTokenizer, RecursiveMap, RegexTokenizer, Token} from "..";
import {XMLEntity} from "../types/parser/XML";

export const ParseXML = (input: string) => {
    const tokens = XMLTokenizer.run(input);

    return RecursiveMap<XMLEntity>(tokens, token => token.isToken && token.value[0] !== "/" && token.value[token.value.length-1] !== "/", token => token.isToken && token.value[0] === "/", token => {
        if(token.isToken) {
            const token1 = token;
            token1.value = token1.value.substring(0, token1.value.length-1);
            return parseXMLEntity(token1);
        }

        return token.value;
    }, (tokens1, startToken, endToken) => {
        if(startToken.value.split(" ")[0] !== endToken.value.substring(1)) throw new Error("An XML tag must be closed by a tag of the same name.");

        let entity = parseXMLEntity(startToken);

        if(tokens1.length === 1 && typeof(tokens1[0]) === "string") entity.content = tokens1[0];
        else entity.content = tokens1;

        return entity;
    });
}

const parseXMLEntity = (token: Token) : XMLEntity => {
    let value = token.value;
    if(value[value.length-1] === "/") value = value.substring(0, value.length-1);

    const name = value.split(" ")[0];
    const attributes = XMLAttributeTokenizer.run(value.substring(name.length));

    let entity = {name, attributes: {}, content: ""};

    for (let attribute of attributes) {
        const key = attribute.data[0].substring(1);

        if(entity.attributes[key]) throw new Error("An XML attribute cannot be defined twice.");

        const value = attribute.data[1];
        entity.attributes[key] = value.substring(1, value.length-1);
    }

    return entity;
}

const XMLTokenizer = new TokenizerChain(new RegexTokenizer(/<(".*?"|.*?)*?>/g)).token(new CustomTokenizer(input => [{value: input.substring(1, input.length-1), isToken: true}])).text(new CustomTokenizer(input => {
    if(!input || !input.trim().replace(/\n+/g, "")) return [];
    return [{value: input, isToken: false}];
}));
const XMLAttributeTokenizer = new TokenizerChain(new RegexTokenizer(/ .*?=".*?"| .*?='.*?'/g)).token(new CustomTokenizer(input => {
    const split = input.split("=");

    return [
        {value: null, isToken: true, data: [split.shift(), split.join("=")]}
    ];
})).text(new CustomTokenizer(input => {
    if(!input || !input.trim().replace(/\n+/g, "")) return [];
    throw new Error("An attribute must have a value." + input);
}));