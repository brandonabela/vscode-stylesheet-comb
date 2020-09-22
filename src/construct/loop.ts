import { AstLoop } from "../ast/function/ast-loop";
import { ConstructUtil } from "../construct-util/construct-util";

export class Loop {
    private static openLoopStride(tokens: string[], index: number): number {
        // Calculating the stride for every possible iteration expression

        const lessStride = ConstructUtil.getStride(tokens, index, '(', '{');
        const forStride = ConstructUtil.getStride(tokens, index, '@for', '{');
        const whileStride = ConstructUtil.getStride(tokens, index, '@while', '{');
        const eachStride = ConstructUtil.getStride(tokens, index, '@each', '{');

        // Check if at least 1 stride is valid

        const validStrides = [lessStride, forStride, whileStride, eachStride].filter(x => x > -1);
        const minStride = Math.min(...validStrides);

        if (validStrides.length === 0) {
            return -1;
        }

        // Obtaining the command for the open loop

        const endIndex = index + (minStride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        if (lessStride === minStride && !command.includes('when')) {
            return -1;
        }

        // Checking if command contains invalid characters

        if (command.indexOf('}') !== -1) {
            return -1;
        }

        return minStride;
    }

    static openLoopTotalStride(tokens: string[], index: number): number {
        const loopStride = Loop.openLoopStride(tokens, index);

        return ConstructUtil.getTotalStride(tokens, index, loopStride);
    }

    static getExpression(command: string): string {
        // Retrieve open curly bracket position

        const openCurlyPosition = command.lastIndexOf('{');

        // Format and return the loop expression

        let value = command.substring(0, openCurlyPosition).trim().replace(/\s+/g, ' ');
        value = value.split('( ').join('(');
        value = value.split('when(').join('when (');

        return value;
    }

    static constructOpenLoop(tokens: string[], index: number, indent: string = ''): AstLoop | undefined {
        // Obtaining the open loop stride

        const stride = this.openLoopStride(tokens, index);

        if (stride === -1) {
            return undefined;
        }

        // Obtaining entire open loop

        const endIndex = index + (stride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        // Obtaining expression and side comment

        const expression = Loop.getExpression(command);
        const sideComment = ConstructUtil.getSideComment(tokens, endIndex);

        // Return Loop

        return new AstLoop(expression, [], indent, sideComment);
    }
}
