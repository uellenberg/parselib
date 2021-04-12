import {TokenizerChain} from "../tokenizerChain";
import {RegexTokenizer, Token} from "..";

/**
 * Parse and solve a mathematical expression.
 * @param input {string} - is the expression as a string.
 */
export const ParseExpression = (input: string) : number => {
    if(input == null) throw new Error("An input is required.");

    //Implicit multiplication, such as 1(2), and (2)1 need to be changed to explicit multiplication.
    input = input.replace(/(\d)\(/g, "$1*(").replace(/\)(\d)/g, ")*$1");

    //Next, we will tokenize our input using the parentheses tokenizer. From this, we can continuously solve the deepest nested parentheses using recursion.
    const parentheses = parenthesesTokenizerChain.run(input);

    return parseFloat(recurseSolveParentheses(parentheses));
}

//The aim of this function is to find the all of the highest parentheses, then replace them with a number by recursively calling this function on all nested parenthases.
const recurseSolveParentheses = (tokens: Token[]) : string => {
    let depth = 0;
    let startPos = -1;
    let out: string = "";

    //We need to go through each token, and find the highest nested parentheses.
    for(let i = 0; i < tokens.length; i++){
        if(tokens[i].isToken) {
            if(tokens[i].value === "("){
                if(depth === 0) startPos = i;
                depth++;
            } else {
                if(startPos === -1) throw new Error("The input contains an invalid sequence of parentheses.");
                if(depth === 1) out += recurseSolveParentheses(tokens.slice(startPos+1, i));
                depth--;
            }
        }
        else if(depth === 0) {
            out += tokens[i].value;
        }

        if(depth < 0){
            throw new Error("The input contains an invalid sequence of parentheses.");
        }
    }

    if(depth !== 0) throw new Error("The input contains an invalid sequence of parentheses.");

    return solve(out);
}

//This contains information about each operator that will be used below.
const operators: Record<string, numberFunction> = {
    "^": Math.pow,
    "*": (a, b) => a*b,
    "/": (a, b) => a/b,
    "+": (a, b) => a+b,
    "-": (a, b) => a-b
};
const operatorKeys = Object.keys(operators);
type numberFunction = (a: number, b: number) => number;

//This function takes in a simple expression, without any parentheses, and evaluates it using the noParenthesesTokenizerChain. The tokenizer chain has the added benefit of non-tokens only being operators.
const solve = (input: string) : string => {
    let tokens: Token[] = noParenthesesTokenizerChain.run(input);

    for (const operator of operatorKeys) {
        const opFun = operators[operator];

        let count = 0;

        do {
            count = 0;

            for (let i = 0; i < tokens.length; i++) {
                if(!tokens[i].isToken && !operatorKeys.includes(tokens[i].value)) throw new Error("The input mathematical expression contains an invalid operator.");
                if (tokens[i].value !== operator) continue;
                if (i === 0 || i === tokens.length - 1) throw new Error("The input mathematical expression contains an operator without a number on both sides.");

                let a = parseFloat(tokens[i - 1].value);
                let b = parseFloat(tokens[i + 1].value);

                tokens.splice(i - 1, 3, {value: opFun(a, b).toString(), isToken: true});
                count++;
            }
        } while(count > 0);
    }

    if(tokens.length < 1) throw new Error("There was an error evaluating the mathematical expression.");
    return tokens[0]?.value;
}

//This will extract "(" and ")" as tokens, and make it easier to find everything in between them.
const parenthesesTokenizerChain = new TokenizerChain(new RegexTokenizer(/[()]/g));

//The regular expression here is a bit complicated, but essentially it looks for one or more digits, followed by one or zero of a group containing a single dot and one or more digits.
//Behind this, is an optional hyphen that will only match if it is not preceded by the above definition of a number or by a ).
const noParenthesesTokenizerChain = new TokenizerChain(new RegexTokenizer(/((?<!((\d+(\.\d+)?)|\)))-)?\d+(\.\d+)?/g));