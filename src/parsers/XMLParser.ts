import {TokenizerChain} from "../tokenizerChain";
import {CustomTokenizer, RecursiveMap, RegexTokenizer, Token} from "..";
import {XMLDocument, XMLEntity} from "../types/parser/XML";

/**
 * A function to parse an XML document into an object. This only provides parsing capabilities, not querying.
 * @param input {string} - is the XML document in string format.
 */
export const ParseXML = (input: string) : XMLDocument => {
    const tokens = XMLTokenizer.run(input);

    let entities = RecursiveMap<XMLEntity>(tokens, token => token.isToken && token.value[0] !== "/" && token.value[token.value.length-1] !== "/" && !(token.value[0] === "?" && token.value[token.value.length-1] === "?"), token => token.isToken && token.value[0] === "/", token => {
        if(token.isToken) {
            const token1 = token;
            token1.value = token1.value.substring(0, token1.value.length-1);

            let entity = parseXMLEntity(token1);
            entity.content = null;
            return entity;
        }

        return token.value;
    }, (tokens1, startToken, endToken) => {
        if(startToken.value.split(" ")[0] !== endToken.value.substring(1)) throw new Error("An XML tag must be closed by a tag of the same name.");

        let entity = parseXMLEntity(startToken);

        if(tokens1.length === 1 && typeof(tokens1[0]) === "string") entity.content = tokens1[0];
        else entity.content = tokens1;

        return entity;
    });

    let document: XMLDocument = {attributes: {}, content: []};

    entities = entities.filter(entity => {
        if(typeof(entity) !== "object") return false;
        if(entity.name !== "?xml") return true;

        for (let attributesKey of Object.keys(entity.attributes)) {
            document.attributes[attributesKey] = entity.attributes[attributesKey];
        }

        return false;
    });

    document.content = entities;
    return document;
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