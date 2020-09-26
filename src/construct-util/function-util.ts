import { AstFunction } from "../ast/ast-function";
import { AstNode } from "../ast/ast-node";
import { AstComment } from "../ast/statement/ast-comment";
import { AstInclude } from "../ast/statement/ast-include";
import { AstMixinCall } from "../ast/statement/ast-mixin-call";
import { AstProperty } from "../ast/statement/ast-property";
import { AstUnclassified } from "../ast/statement/ast-unclassified";
import { AstVariable } from "../ast/statement/ast-variable";
import { Comment } from "../construct/comment";
import { Include } from "../construct/include";
import { MixinCall } from "../construct/mixin-call";
import { Property } from "../construct/property";
import { Unclassified } from "../construct/unclassified";
import { Variable } from "../construct/variable";
import { Format } from "../extension/format";
import { ConstructUtil } from "./construct-util";

export class FunctionUtil {
    static isFunction(astNode: AstNode): boolean {
        return astNode instanceof AstFunction;
    }

    static isCloseFunction(categories: AstNode[], index: number): boolean {
        const line = categories[index].toString();
        const command = ConstructUtil.getCommand(line).trim();

        return command === '}' && Unclassified.isUnclassified(categories[index]);
    }

    static closeCommentStride(categories: AstNode[], index: number): number {
        // Return comment stride if close function

        if (FunctionUtil.isCloseFunction(categories, index)) {
            // Check if is close detached ruleset

            let isDetached = 0;

            if (index + 1 < categories.length && categories[index + 1].toString().indexOf(';') === 0) {
                isDetached = 1;
            }

            // Calculating close comment stride

            const commentStride = Unclassified.commentStride(categories, index);
            return isDetached + (commentStride !== -1 ? commentStride - 1 : 0);
        }

        // Return 0 if not close function

        return 0;
    }

    static constructCloseComment(categories: AstNode[], index: number, indent: string): AstComment | undefined {
        // If not unclassified return undefined

        if (!Unclassified.isUnclassified(categories[index])) {
            return undefined;
        }

        // Construct comment if a close selector

        const isClose = FunctionUtil.isCloseFunction(categories, index);

        if (isClose) {
            // Check if detached ruleset

            let unclassified = Unclassified.getUnclassified(categories, index);

            if (1 < unclassified.length && unclassified[0].trim() === '}' && unclassified[1].trim().indexOf(';') === 0) {
                unclassified = unclassified.slice(1);
            }

            unclassified[0] = ConstructUtil.getComment(unclassified[0]);

            // Return formatted comment

            return Comment.constructComment(unclassified, 0, indent);
        }

        // Return undefined if not a close selector

        return undefined;
    }

    static functionStride(categories: AstNode[], index: number): number {
        let selectorCount = 0;

        for (let i = index + 1; i < categories.length; i++) {
            if (FunctionUtil.isFunction(categories[i])) {
                selectorCount++;
            } else if (FunctionUtil.isCloseFunction(categories, i)) {
                if (selectorCount === 0) {
                    return (i + 1) - index;
                } else {
                    selectorCount--;
                }

                i += FunctionUtil.closeCommentStride(categories, i);
            }
        }

        return (categories.length + 1) - index;
    }

    static functionTotalStride(categories: AstNode[], index: number): number {
        const selectorStride = FunctionUtil.functionStride(categories, index);
        const commentStride = FunctionUtil.closeCommentStride(categories, index + selectorStride - 1);

        return selectorStride + commentStride;
    }

    static getVariable(categories: AstNode[], index: number, deepIndent: string, indentSize: string): AstVariable {
        const astVariable = categories[index] as AstVariable;
        astVariable.indent = deepIndent;
        astVariable.indentSize = indentSize;

        return astVariable;
    }

    static getMixinCall(categories: AstNode[], index: number, deepIndent: string): AstMixinCall {
        const astMixinCall = categories[index] as AstMixinCall;
        astMixinCall.indent = deepIndent;

        return astMixinCall;
    }

    static getProperty(categories: AstNode[], index: number, deepIndent: string): AstProperty {
        const astProperty = categories[index] as AstProperty;
        astProperty.indent = deepIndent;

        return astProperty;
    }

    static getInclude(categories: AstNode[], index: number, deepIndent: string): AstInclude {
        const astInclude = categories[index] as AstInclude;
        astInclude.indent = deepIndent;

        return astInclude;
    }

    static getComment(categories: AstNode[], index: number, deepIndent: string): AstComment {
        const astComment = categories[index] as AstComment;
        astComment.indent = deepIndent;

        return astComment;
    }

    static getUnclassified(categories: AstNode[], index: number, deepIndent: string): AstUnclassified {
        const astUnclassified = categories[index] as AstUnclassified;
        astUnclassified.indent = deepIndent;
        astUnclassified.line = astUnclassified.line.trim();

        return astUnclassified;
    }

    static constructFunction(categories: AstNode[], index: number, tabSize: number, isSpaces: boolean, depth: number = 0): AstFunction | undefined {
        // If not a function return undefined

        if (!FunctionUtil.isFunction(categories[index])) {
            return undefined;
        }

        // Finding all the necessary indentation that are needed for the function

        const indentSize = Format.getIndent(tabSize, isSpaces, 1);
        const baseIndent = Format.getIndent(tabSize, isSpaces, depth);
        const deepIndent = Format.getIndent(tabSize, isSpaces, depth + 1);

        // Updating the indication of the function

        let astFunction = categories[index] as AstFunction;
        astFunction.indent = baseIndent;

        // Calculating the function stride

        const functionStride = FunctionUtil.functionStride(categories, index);

        // Loop through every category of the function

        for (let i = index + 1; i < index + functionStride; i++) {
            if (Variable.isVariable(categories[i])) {
                const astVariable = FunctionUtil.getVariable(categories, i, deepIndent, indentSize);
                astFunction.properties.push(astVariable);
            } else if (MixinCall.isMixinCall(categories[i])) {
                const astMixinCall = FunctionUtil.getMixinCall(categories, i, deepIndent);
                astFunction.properties.push(astMixinCall);
            } else if (Property.isProperty(categories[i])) {
                const astProperty = FunctionUtil.getProperty(categories, i, deepIndent);
                astFunction.properties.push(astProperty);
            } else if (Include.isInclude(categories[i])) {
                const astInclude = FunctionUtil.getInclude(categories, i, deepIndent);
                astFunction.properties.push(astInclude);
            } else if (Comment.isComment(categories[i])) {
                const astComment = FunctionUtil.getComment(categories, i, deepIndent);
                astFunction.properties.push(astComment);
            } else if (FunctionUtil.isFunction(categories[i])) {
                const subSelector = FunctionUtil.constructFunction(categories, i, tabSize, isSpaces, depth + 1);
                astFunction.properties.push(subSelector as AstFunction);

                i += FunctionUtil.functionTotalStride(categories, i) - 1;
            } else if (FunctionUtil.isCloseFunction(categories, i)) {
                astFunction.endComment = FunctionUtil.constructCloseComment(categories, i, baseIndent);

                i += FunctionUtil.closeCommentStride(categories, i);
            } else if (Unclassified.isUnclassified(categories[i])) {
                const astUnclassified = FunctionUtil.getUnclassified(categories, i, deepIndent);
                astFunction.properties.push(astUnclassified);
            }
        }

        return astFunction;
    }
}
