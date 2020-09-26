import { AstNode } from "../ast/ast-node";
import { AstStatement } from "../ast/ast-statement";
import { ConstructUtil } from "./construct-util";

export class StatementUtil {
    static isStatement(categories: AstNode[], index: number): boolean {
        return categories[index] instanceof AstStatement;
    }

    static statementStride(tokens: string[], index: number): number {
        // Store stride between colon and semicolon or open curly bracket

        const colonSemicolonStride = ConstructUtil.getStride(tokens, index, ':', ';');
        const colonOpenCurlyStride = ConstructUtil.getStride(tokens, index, ':', '{');

        // Return statement stride if valid

        if (colonSemicolonStride !== -1 && (colonOpenCurlyStride === -1 || colonSemicolonStride < colonOpenCurlyStride)) {
            return colonSemicolonStride;
        }

        // Return -1 if not statement

        return -1;
    }

    static formatStatementValue(value: string): string {
        // Removing double spacing

        value = value.replace(/\s+/g, ' ').trim();

        // Removing any spaces within round brackets

        const openRoundPosition = value.indexOf('(');
        const closeRoundPosition = value.indexOf(')');

        if (openRoundPosition !== -1 && closeRoundPosition !== -1) {
            const startValue = value.substring(0, openRoundPosition + 1);
            const middleValue = value.substring(openRoundPosition + 1, closeRoundPosition).trim();
            const endValue = value.substring(closeRoundPosition);

            value = startValue + middleValue + endValue;
        }

        return value;
    }

    static getProperty(command: string): string {
        // Retrieve colon position

        const colonPosition = command.indexOf(':');

        // Return property

        return command.substring(0, colonPosition).trim();
    }

    static getPropertyValue(command: string): string {
        // Retrieve colon and semicolon position

        const colonPosition = command.indexOf(':');
        const semiColonPosition = command.indexOf(';');

        // Retrieve property value

        const propertyValue = command.substring(colonPosition + 1, semiColonPosition);

        // Format property value

        return StatementUtil.formatStatementValue(propertyValue);
    }
}
