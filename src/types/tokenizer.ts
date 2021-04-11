import {TokenizerChain} from "../tokenizerChain";

/**
 * An interface for the output of a tokenizer.
 */
export interface Token {
    /**
     * The value of the token.
     */
    value: string;
    /**
     * If the token was what the tokenizer was searching for.
     */
    isToken: boolean;
    /**
     * Custom data that a tokenizer can add to the token.
     */
    data?: any;
}

/**
 * A tokenizer callback that can modify part of the tokenizer output.
 */
export type TokenCallback = (token: Token) => Token[];

/**
 * An interface for tokenizers.
 */
export interface Tokenizer {
    /**
     * A method to tokenize a string using the tokenizer's config.
     * @param input {string} - the input string that will be tokenized.
     * @param modify {TokenCallback} - the callback that will be ran on every element of the output array.
     */
    tokenize(input: string, modify?: TokenCallback) : Token[];
}

/**
 * The callback that will give a new TokenizerChain that can be used to further the chain.
 */
export type TokenizerChainAddCallback = (chain: TokenizerChain) => void;