import { AstNode } from "../ast/ast-node";
import { AstInclude } from "../ast/statement/ast-include";
import { ConstructUtil } from "../construct-util/construct-util";

export class Include {
    static isInclude(astNode: AstNode): boolean {
        return astNode instanceof AstInclude;
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

        // Format the include line

        let value = command.substring(0, semiColonPosition).trim().replace(/\s+/g, ' ');
        value = value.split('( ').join('(');
        value = value.split(') ').join(')');

        // Check if import has url

        if (value.indexOf('url') !== -1) {
            const firstQuotePosition = value.indexOf('\'');
            const secondQuotePosition = value.substring(firstQuotePosition + 1).indexOf('\'');

            const originalQuote = value.substring(firstQuotePosition + 1, (firstQuotePosition + 1) + secondQuotePosition);
            const modifiedQuote = originalQuote.split(' ').join('');

           value = value.replace(originalQuote, modifiedQuote);
        }

        // Return the formatted include line

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
