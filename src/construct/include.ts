import { AstNode } from "../ast/ast-node";
import { AstInclude } from "../ast/statement/ast-include";
import { ConstructUtil } from "../construct-util/construct-util";

export class Include {
    static isInclude(categories: AstNode[], index: number): boolean {
        return categories[index] instanceof AstInclude;
    }

    private static includeStride(tokens: string[], index: number): number {
        // Storing two strides between keyword and semicolon

        const importStride = ConstructUtil.getStride(tokens, index, '@import', ';');
        const includeStride = ConstructUtil.getStride(tokens, index, '@include', ';');

        // Return stride if valid

        if (importStride !== -1) {
            return importStride;
        } else if (includeStride !== -1) {
            return includeStride;
        }

        // Return -1 if not include statement

        return -1;
    }

    static includeTotalStride(tokens: string[], index: number): number {
        const includeStride = Include.includeStride(tokens, index);

        return ConstructUtil.getTotalStride(tokens, index, includeStride);
    }

    static getIncludeLine(command: string): string {
        // Retrieve open curly bracket position

        const semiColonPosition = command.lastIndexOf(';');

        // Format and return the include line

        let value = command.substring(0, semiColonPosition).trim().replace(/\s+/g, ' ');
        value = value.split('( ').join('(');
        value = value.split(') ').join(')');

        return value;
    }

    static constructInclude(tokens: string[], index: number, indent: string = ''): AstInclude | undefined {
        // Return undefined if not a property

        const stride = Include.includeStride(tokens, index);

        if (stride === -1) {
            return undefined;
        }

        // Obtaining entire property

        const endIndex = index + (stride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        // Obtaining line and side comment

        const line = Include.getIncludeLine(command);
        const sideComment = ConstructUtil.getSideComment(tokens, endIndex);

        // Return Property

        return new AstInclude(line, indent, sideComment);
    }
}
