import { AstNode } from "../ast/ast-node";
import { AstMixinCall } from "../ast/statement/ast-mixin-call";
import { ConstructUtil } from "../construct-util/construct-util";
import { MixinUtil } from "../construct-util/mixin-util";

export class MixinCall {
    static isMixinCall(categories: AstNode[], index: number): boolean {
        return categories[index] instanceof AstMixinCall;
    }

    private static mixinCallStride(tokens: string[], index: number): number {
        // Store two character stride length and comment stride

        const openCloseRoundStride = ConstructUtil.getStride(tokens, index, '(', ')');
        const colonOpenRoundStride = ConstructUtil.getStride(tokens, index, ':', '(');

        // Check if mixin call

        const endIndex = index + (openCloseRoundStride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        if (command.indexOf('@include') !== -1 || command.indexOf('@import') !== -1) {
            return -1;
        }

        // Return -1 if not mixin call

        if (openCloseRoundStride !== -1 && (colonOpenRoundStride === -1 || openCloseRoundStride < colonOpenRoundStride)) {
            let isNextSemicolon = false;

            if (endIndex + 1 < tokens.length) {
                isNextSemicolon = ConstructUtil.getCommand(tokens[endIndex + 1]).trim() === ';';
            }

            return openCloseRoundStride + (isNextSemicolon ? 1 : 0);
        }

        // Return -1 if not mixin call

        return -1;
    }

    static mixinCallTotalStride(tokens: string[], index: number): number {
        const mixinCallStride = MixinCall.mixinCallStride(tokens, index);

        return ConstructUtil.getTotalStride(tokens, index, mixinCallStride);
    }

    static constructMixinCall(tokens: string[], index: number, indent: string = ''): AstMixinCall | undefined {
        // Return undefined if not a mixin call

        const stride = MixinCall.mixinCallStride(tokens, index);

        if (stride === -1) {
            return undefined;
        }

        // Obtaining entire mixin call

        const endIndex = index + (stride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        // Obtaining mixin, parameters and side comment

        const mixin = MixinUtil.getMixin(command);
        const parameters = MixinUtil.getParameterLine(command);
        const sideComment = ConstructUtil.getSideComment(tokens, endIndex);

        // Return Property

        return new AstMixinCall(mixin, parameters, indent, sideComment);
    }
}
