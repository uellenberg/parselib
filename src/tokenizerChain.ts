import {Token, Tokenizer, TokenizerChainAddCallback} from "./types/tokenizer";

/**
 * A class providing easy tokenizer chaining.
 */
export class TokenizerChain {
    private tokenizer: Tokenizer;
    private tokenTokenizerChain: TokenizerChain;
    private textTokenizerChain: TokenizerChain;

    /**
     * Create a tokenizer chain.
     * @param initialTokenizer {Tokenizer} - is the first tokenizer that will be used.
     */
    public constructor(initialTokenizer: Tokenizer) {
        this.tokenizer = initialTokenizer;
    }

    /**
     * Set the tokenizer that will be ran on every token.
     * @param tokenizer {Tokenizer} - the tokenizer that will be used.
     * @param callback {TokenizerChainAddCallback} - a function providing a new TokenizerChain that can be used to add further tokenizers to the chain.
     */
    public token(tokenizer: Tokenizer, callback?: TokenizerChainAddCallback) : TokenizerChain {
        this.tokenTokenizerChain = new TokenizerChain(tokenizer);
        if(callback) callback(this.tokenTokenizerChain);
        return this;
    }

    /**
     * Set the tokenizer that will be ran on every non-token.
     * @param tokenizer {Tokenizer} - the tokenizer that will be used.
     * @param callback {TokenizerChainAddCallback} - a function providing a new TokenizerChain that can be used to add further tokenizers to the chain.
     */
    public text(tokenizer: Tokenizer, callback?: TokenizerChainAddCallback) : TokenizerChain {
        this.textTokenizerChain = new TokenizerChain(tokenizer);
        if(callback) callback(this.textTokenizerChain);
        return this;
    }

    /**
     * Run the tokenizer chain on a text input.
     * @param input {string} - the input text that will be tokenized by the tokenizer chain.
     */
    public run(input: string) : Token[] {
        return this.tokenizer.tokenize(input, token => {
            let tokens : Token[] = [token];

            if(token.isToken && this.tokenTokenizerChain) tokens = this.tokenTokenizerChain.run(token.value);
            else if(!token.isToken && this.textTokenizerChain) tokens = this.textTokenizerChain.run(token.value);

            return tokens;
        });
    }
}