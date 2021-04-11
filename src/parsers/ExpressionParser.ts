import {TokenizerChain} from "../tokenizerChain";
import {RegexTokenizer, Token} from "..";

/**
 * Parse and solve a mathematical expression.
 * @param input {string} - is the expression as a string.
 */
export const ParseExpression = (input: string) : number => {
    //Implicit multiplication, such as 1(2), and (2)1 need to be changed to explicit multiplication.
    input = input.replace(/(\d)\(/g, "$1*(").replace(/\)(\d)/g, ")*$1");

    //Next, we will tokenize our input using the parentheses tokenizer. From this, we can continuously solve the deepest nested parentheses using recursion.
    const parentheses = parenthesesTokenizerChain.run(input);

    console.log(recurseSolveParentheses(parentheses));
    return 0;
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
                if(depth === 1) {
                    if(startPos === -1) throw new Error("The input contains an invalid sequence of parentheses.");
                    out += recurseSolveParentheses(tokens.slice(startPos+1, i));
                }
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

//This function takes in a simple expression, without any parentheses, and evaluates it using the noParenthesesTokenizerChain. The tokenizer chain has the added benefit of non-tokens only being operators.
const solve = (input: string) : string => {

}

//This will extract "(" and ")" as tokens, and make it easier to find everything in between them.
const parenthesesTokenizerChain = new TokenizerChain(new RegexTokenizer(/\(/)).text(new RegexTokenizer(/\)/));

//The regular expression here is a bit complicated, but essentially it looks for one or more digits, followed by one or zero of a group containing a single dot and one or more digits.
//Behind this, is an optional hyphen that will only match if it is not preceded by the above definition of a number.
const noParenthesesTokenizerChain = new TokenizerChain(new RegexTokenizer(/((?<!\d+(\.\d+)?)-)?\d+(\.\d+)?/));