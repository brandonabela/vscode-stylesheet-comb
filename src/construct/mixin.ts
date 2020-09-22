import { AstMixin } from "../ast/function/ast-mixin";
import { ConstructUtil } from "../construct-util/construct-util";
import { MixinUtil } from "../construct-util/mixin-util";

export class Mixin {
    private static openMixinStride(tokens: string[], index: number): number {
        // Calculating the stride between open round bracket and open curly bracket

        const stride = ConstructUtil.getStride(tokens, index, '(', '{');

        if (stride === -1) {
            return -1;
        }

        // Obtaining entire mixin command

        const endIndex = index + (stride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        if (command.indexOf(');') !== -1 || command.indexOf('}') !== -1) {
            return -1;
        }

        return stride;
    }

    static openMixinTotalStride(tokens: string[], index: number): number {
        const mixinStride = Mixin.openMixinStride(tokens, index);

        return ConstructUtil.getTotalStride(tokens, index, mixinStride);
    }

    static constructOpenMixin(tokens: string[], index: number, indent: string = ''): AstMixin | undefined {
        // Obtaining the open mixin stride

        const stride = this.openMixinStride(tokens, index);

        if (stride === -1) {
            return undefined;
        }

        // Obtaining entire mixin command

        const endIndex = index + (stride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        // Obtaining mixin, parameters and side comment

        const mixin = MixinUtil.getMixin(command);
        const parameters = MixinUtil.getParameterLine(command);
        const sideComment = ConstructUtil.getSideComment(tokens, endIndex);

        // Return Loop

        return new AstMixin(mixin, parameters, [], indent, sideComment);
    }
}
