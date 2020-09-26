import { AstNode } from "../ast/ast-node";
import { AstUnclassified } from "../ast/statement/ast-unclassified";
import { FunctionUtil } from "../construct-util/function-util";
import { Unclassified } from "../construct/unclassified";
import { Variable } from "../construct/variable";

export class Format {
    static getIndent(tabSize: number, isSpaces: boolean, depth: number): string {
        return (isSpaces ? ' ' : '\t').repeat(tabSize * depth);
    }

    static formatStyle(categories: AstNode[], tabSize: number, isSpaces: boolean): AstNode[] {
        let ast: AstNode[] = [];

        for (let i = 0; i < categories.length; i++) {
            // Start with skip stride set to 1

            let skipStride = 1;

            // Add the first valid category implying that the order of the if statements is important

            const astFunction = FunctionUtil.constructFunction(categories, i, tabSize, isSpaces);

            if (astFunction !== undefined) {
                skipStride = FunctionUtil.functionTotalStride(categories, i);
                ast.push(astFunction);
            } else if (Variable.isVariable(categories[i])) {
                const indentSize = Format.getIndent(tabSize, isSpaces, 1);
                const variable = FunctionUtil.getVariable(categories, i, '', indentSize);
                ast.push(variable);
            } else if (Unclassified.isUnclassified(categories[i])) {
                const unclassified = categories[i] as AstUnclassified;
                unclassified.line = unclassified.line.trim();
                ast.push(unclassified);
            } else {
                ast.push(categories[i]);
            }

            // Skipping lines based on the category stride

            i += skipStride !== -1 ? (skipStride - 1) : 0;
        }

        // Return ast

        return ast;
    }
}