import {Token, TokenCallback, Tokenizer} from "../types/tokenizer";

/**
 * A simple class to make creating simple tokenizers simpler.
 */
export class CustomTokenizer implements Tokenizer {
    private readonly callback: CustomTokenizerCallback;

    /**
     * Create a new CustomTokenizer.
     * @param callback {CustomTokenizerCallback} - the callback that will be ran on the input to the tokenizer.
     */
    public constructor(callback: CustomTokenizerCallback) {
        this.callback = callback;
    }

    /**
     * @inheritDoc
     */
    tokenize(input: string, modify?: TokenCallback): Token[] {
        let tokens = this.callback(input);

        if(!modify) return tokens;

        let tokens1 : Token[] = [];

        for (let token of tokens) {
            tokens1.push(...modify(token));
        }

        return tokens1;
    }
}

/**
 * The callback that will be ran on the input to the tokenizer
 */
export type CustomTokenizerCallback = (input: string) => Token[];