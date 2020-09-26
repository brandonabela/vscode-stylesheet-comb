import { AstNode } from "../ast/ast-node";
import { AstProperty } from "../ast/statement/ast-property";
import { ConstructUtil } from "../construct-util/construct-util";
import { StatementUtil } from "../construct-util/statement-util";

export class Property {
    static isProperty(astNode: AstNode): boolean {
        return astNode instanceof AstProperty;
    }

    private static propertyStride(tokens: string[], index: number): number {
        return StatementUtil.statementStride(tokens, index);
    }

    static propertyTotalStride(tokens: string[], index: number): number {
        const propertyStride = Property.propertyStride(tokens, index);

        return ConstructUtil.getTotalStride(tokens, index, propertyStride);
    }

    static constructProperty(tokens: string[], index: number, indent: string = ''): AstProperty | undefined {
        // Return undefined if not a property

        const stride = Property.propertyStride(tokens, index);

        if (stride === -1) {
            return undefined;
        }

        // Obtaining entire property

        const endIndex = index + (stride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        // Obtaining property, value and side comment

        const property = StatementUtil.getProperty(command);
        const value = StatementUtil.getPropertyValue(command);
        const sideComment = ConstructUtil.getSideComment(tokens, endIndex);

        // Return Property

        return new AstProperty(property, value, indent, sideComment);
    }
}
