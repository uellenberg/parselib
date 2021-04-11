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
     * @param regex {RegExp} - the regular expression that will be used to find tokens.
     */
    public constructor(regex: RegExp) {
        this.regex = regex;
    }

    /**
     * @inheritDoc
     */
    public tokenize(input: string, modify?: TokenCallback): Token[] {
        let text = input;
        let regResult : RegExpExecArray = null;
        let out : Token[] = [];

        while((regResult = this.regex.exec(text)) !== null){
            let startText = regResult.index > 0 ? {value: text.substring(0, regResult.index), isToken: false} : null;
            let token = {value: regResult[0], isToken: true};

            text = text.substring(regResult.index+regResult[0].length, text.length);

            if(modify){
                if(startText) out.push(...modify(startText));
                out.push(...modify(token));
            }
            else {
                if(startText) out.push(startText);
                out.push(token);
            }
        }

        if(text.length > 0) {
            let token: Token = {value: text, isToken: false};

            if(modify) out.push(...modify(token));
            else out.push(token);
        }

        return out;
    }
}