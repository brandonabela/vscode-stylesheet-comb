import { AstRuleset } from "../ast/function/ast-ruleset";
import { ConstructUtil } from "../construct-util/construct-util";

export class Ruleset {
    private static openRulesetStride(tokens: string[], index: number): number {
        // Calculating the stride between '@' and open curly bracket

        const stride = ConstructUtil.getStride(tokens, index, '@', '{');

        if (stride === -1) {
            return -1;
        }

        // Obtain entire open ruleset command

        const endIndex = index + (stride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        if (command.indexOf('(') !== -1 || command.indexOf(';') !== -1 || command.indexOf('}') !== -1 || !command.includes('@detached-ruleset')) {
            return -1;
        }

        return stride;
    }

    static openRulesetTotalStride(tokens: string[], index: number): number {
        const openSelectorStride = Ruleset.openRulesetStride(tokens, index);

        return ConstructUtil.getTotalStride(tokens, index, openSelectorStride);
    }

    static constructRuleset(tokens: string[], index: number, indent: string = ''): AstRuleset | undefined {
        // Obtaining the open ruleset stride

        const stride = Ruleset.openRulesetStride(tokens, index);

        if (stride === -1) {
            return undefined;
        }

        // Obtain side comment

        const endIndex = index + (stride - 1);
        const sideComment = ConstructUtil.getSideComment(tokens, endIndex);

        // Return Loop

        return new AstRuleset([], indent, sideComment);
    }
}
