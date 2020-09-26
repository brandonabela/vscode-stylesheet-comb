import { AstFunction } from "../ast/ast-function";
import { AstNode } from "../ast/ast-node";
import { AstComment } from "../ast/statement/ast-comment";
import { AstUnclassified } from "../ast/statement/ast-unclassified";
import { FunctionUtil } from "../construct-util/function-util";
import { Comment } from "../construct/comment";
import { Include } from "../construct/include";
import { MixinCall } from "../construct/mixin-call";
import { Property } from "../construct/property";
import { Unclassified } from "../construct/unclassified";
import { Variable } from "../construct/variable";

export class PostProcessing {
    static needDoubleNewLine(stylesheet: AstNode[], index: number): boolean {
        // Check if next element is present

        const hasNextElement = index < stylesheet.length - 1;

        if (hasNextElement) {
            // Certain elements should not be separated by an enter

            const twoInclude = Include.isInclude(stylesheet[index]) && Include.isInclude(stylesheet[index + 1]);
            const twoMixinCall = MixinCall.isMixinCall(stylesheet[index]) && MixinCall.isMixinCall(stylesheet[index + 1]);
            const twoProperty = Property.isProperty(stylesheet[index]) && Property.isProperty(stylesheet[index + 1]);
            const twoUnclassified = Unclassified.isUnclassified(stylesheet[index]) && Unclassified.isUnclassified(stylesheet[index + 1]);
            const twoVariables = Variable.isVariable(stylesheet[index]) && Variable.isVariable(stylesheet[index + 1]);

            // Check if current and next elements are line comments

            if (Comment.isComment(stylesheet[index]) && Comment.isComment(stylesheet[index + 1])) {
                const currentComment = stylesheet[index] as AstComment;
                const nextComment = stylesheet[index + 1] as AstComment;

                return currentComment.isBlock && nextComment.isBlock;
            }

            return !(twoInclude || twoMixinCall || twoProperty || twoUnclassified || twoVariables);
        }

        // Return false if next element is not present

        return false;
    }

    static separateNodes(stylesheet: AstNode[]): string {
        let separatedNodes = '';

        // Loop through the stylesheet nodes

        for (let i = 0; i < stylesheet.length; i++) {
            // Check if enter is required

            const isDoubleNewLine = this.needDoubleNewLine(stylesheet, i);

            // Adding formatted node

            if (FunctionUtil.isFunction(stylesheet[i])) {
                const astFunction = stylesheet[i] as AstFunction;

                separatedNodes += astFunction.toStringHead();
                separatedNodes += PostProcessing.separateNodes(astFunction.properties);
                separatedNodes += astFunction.toStringTail();
            } else {
                separatedNodes += stylesheet[i].toString();
            }

            // Do not apply new liens if next node is unclassified

            if (i < stylesheet.length - 1 && Unclassified.isUnclassified(stylesheet[i + 1])) {
                const astUnclassified = stylesheet[i + 1] as AstUnclassified;

                if (astUnclassified.line === '') {
                    continue;
                }
            }

            // Adding double new line if required

            separatedNodes += isDoubleNewLine ? '\n\n' : '\n';
        }

        // Return separated nodes

        return separatedNodes;
    }
}