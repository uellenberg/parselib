import {TokenCallback, Token, Tokenizer} from "../types/tokenizer";

/**
 * A tokenizer that can search for tokens using a regular expression.
 *
 * For example, with the input "&lt;p&gt;test&lt;/p&gt;" and a regular expression "/<.*?>/", then the output will be ["&lt;p&gt;", "test", "&lt;/p&gt;"].
 */
export class RegexTokenizer implements Tokenizer {
    private readonly regex: RegExp;

    /**
     * Create a new RegexTokenizer.
     * @param regex {RegExp} - the regular expression that will be used to find tokens. This must have the global flag.
     */
    public constructor(regex: RegExp) {
        if(!regex.global) throw new Error("The regular expression must have the global flag.");
        this.regex = regex;
    }

    /**
     * @inheritDoc
     */
    public tokenize(input: string, modify?: TokenCallback): Token[] {
        console.log("tokenizing ", input, this.regex);

        let out : Token[] = [];

        let regResult : RegExpExecArray = null;
        let lastIndex = -1;
        let lastLength = 0;

        console.log("starting", input);

        while((regResult = this.regex.exec(input)) !== null){
            console.log("result", regResult);

            let startTextStr = input.substring(lastIndex === -1 ? 0 : lastIndex+lastLength, regResult.index);
            console.log(startTextStr);
            console.log(regResult[0]);
            console.log("index: "+lastIndex, lastLength);

            let startText = startTextStr ? {value: startTextStr, isToken: false} : null;
            let token = {value: regResult[0], isToken: true};

            //text = text.substring(startTextStr.length+regResult[0].length);

            if(modify){
                if(startText) out.push(...modify(startText));
                out.push(...modify(token));
            }
            else {
                if(startText) out.push(startText);
                out.push(token);
            }

            lastIndex = regResult.index;
            lastLength = regResult[0].length
        }

        console.log("ending", input)

        if(lastIndex+lastLength < input.length-1) {
        console.log(lastIndex, input.length-1);
            let token: Token = {value: input.substring(lastIndex+lastLength), isToken: false};

            if(modify) out.push(...modify(token));
            else out.push(token);
        }

        console.log("done", out);

        return out;
    }
}