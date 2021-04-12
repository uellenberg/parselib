import {Token} from "..";

/**
 * This function can help you descend layer-by-layer down anything that can open and close itself. Examples of this include the parentheses in mathematical expressions and XML tags.
 *
 * For example, this function could be used to parse XML by finding the lowest nested values, parsing those, then parsing their parent and putting their parsed values into the parent.
 * @param tokens {Token[]} - is the input tokens that will be used.
 * @param startCheckCallback {RecursiveMapCheckCallback} - is a function that determines if a a given token starts what is being searched for.
 * @param endCheckCallback {RecursiveMapCheckCallback} - is a function that determines if a given token ends what is being searched for.
 * @param pushLowestLevelCallback {RecursiveMapPushLowestLevelCallback} - is a function that takes a token on the lowest depth and converts it to the specified type.
 * @param pushOtherCallback {RecursiveMapPushOtherCallback} - is an optional function that takes an output of a previous recursion and transforms it into the specified type.
 * @param returnCallback {RecursiveMapReturnCallback} - is an optional function that can be used to specify a custom output to this function. It's output will be returned and its input is the value that would have been returned otherwise.
 */
export const RecursiveMap = <Type>(tokens: Token[], startCheckCallback: RecursiveMapCheckCallback, endCheckCallback: RecursiveMapCheckCallback, pushLowestLevelCallback: RecursiveMapPushLowestLevelCallback, pushOtherCallback?: RecursiveMapPushOtherCallback, returnCallback?: RecursiveMapReturnCallback) : Type[] => {
    let depth = 0;
    let startPos = -1;
    let out: Type[] = [];

    //We need to go through each token, and find the highest nested sequences.
    for(let i = 0; i < tokens.length; i++){
        if(tokens[i].isToken) {
            if(startCheckCallback(tokens[i])){
                if(depth === 0) startPos = i;
                depth++;
            } else if(endCheckCallback(tokens[i])) {
                if(startPos === -1) throw new Error("The input contains an invalid sequence.");

                if(depth === 1) {
                    let toPush = RecursiveMap<Type>(tokens.slice(startPos + 1, i), startCheckCallback, endCheckCallback, pushLowestLevelCallback, pushOtherCallback, returnCallback);

                    if (pushOtherCallback) out.push(pushOtherCallback(toPush));
                    else out.push(...toPush);
                }
                depth--;
            }
        }
        else if(depth === 0) {
            out.push(pushLowestLevelCallback(tokens[i]));
        }

        if(depth < 0){
            throw new Error("The input contains an invalid sequence.");
        }
    }

    if(depth !== 0) throw new Error("The input contains an invalid sequence.");

    if(returnCallback) return returnCallback(out);
    return out;
}

/**
 * A function that determines if a a given token starts or ends what is being searched for.
 */
export type RecursiveMapCheckCallback = (token: Token) => boolean;
/**
 * A function that takes a token on the lowest depth and converts it to the specified type. The output should match the type used in the RecursiveMap function.
 */
export type RecursiveMapPushLowestLevelCallback = (token: Token) => any;
/**
 * An optional function that takes an output of a previous recursion and transforms it into the specified type. The input and output should match the type used in the RecursiveMap function.
 */
export type RecursiveMapPushOtherCallback = (tokens: any[]) => any;
/**
 * An optional function that can be used to specify a custom output to this function. It's output will be returned and its input is the value that would have been returned otherwise. The input and output should match the type used in the RecursiveMap function.
 */
export type RecursiveMapReturnCallback = (tokens: any[]) => any[];