import { AstNode } from "../ast/ast-node";
import { AstVariable } from "../ast/statement/ast-variable";
import { ConstructUtil } from "../construct-util/construct-util";
import { StatementUtil } from "../construct-util/statement-util";
import { PreProcessing } from "../extension/pre-processing";

export class Variable {
    static isVariable(astNode: AstNode): boolean {
        return astNode instanceof AstVariable;
    }

    private static variableStride(tokens: string[], index: number): number {
        const isLessVariable = tokens[index].trim().startsWith('@');
        const isSassVariable = tokens[index].trim().startsWith('$');

        const stride = StatementUtil.statementStride(tokens, index);

        return (isLessVariable || isSassVariable) ? stride : -1;
    }

    static variableTotalStride(tokens: string[], index: number): number {
        const variableStride = Variable.variableStride(tokens, index);

        return ConstructUtil.getTotalStride(tokens, index, variableStride);
    }

    static getVariableValue(command: string): string[] {
        // Getting the variable value

        let value = StatementUtil.getPropertyValue(command);

        // Check if the variable value contains multiple values

        let firstCharacter = value.trim().charAt(0);

        if (firstCharacter !== '(') {
            return [value];
        }

        // Splitting the variable value to be structured as an object

        let split = [value];

        split = PreProcessing.splitArray(split, ',', false);
        split = PreProcessing.splitArray(split, '\'', false, [',']);
        split = PreProcessing.splitArray(split, '"', false, [',']);
        split = PreProcessing.splitArray(split, '(', true, ['"']);
        split = PreProcessing.splitArray(split, ')', false);

        // Merging certain lines that belong together

        let values: string[] = [];
        let inQuotes = false;

        // Loop through all the split elements

        for (let i = 0; i < split.length; i++) {
            // Check if the line is within the quote if so add to the previous element else add a new element

            const trimmedValue = split[i].trim();

            if (!inQuotes) {
                values.push(trimmedValue);
            } else {
                values[values.length - 1] += trimmedValue;
            }

            // Count the number of quotes and check if line is spread in multiple lines

            const singleQuoteCount = split[i].split('\'').length - 1;
            const doubleQuoteCount = split[i].split('"').length - 1;

            if ((singleQuoteCount !== 0 && (singleQuoteCount % 2) !== 0) || (doubleQuoteCount !== 0 && (doubleQuoteCount % 2) !== 0)) {
                inQuotes = !inQuotes;
            }
        }

        // Applying spacing between colons and 'and' keyword and remove double spacing

        values = values.map(splitValue => splitValue.split(':').join(': '));
        values = values.map(splitValue => splitValue.split('and').join(' and'));
        values = values.map(splitValue => splitValue.replace(/\s+/g, ' '));

        // Return the variable values

        return values;
    }

    static constructVariable(tokens: string[], index: number, indent: string = '', indentSize: string = ''): AstVariable | undefined {
        // Return undefined if not a variable

        const stride = Variable.variableStride(tokens, index);

        if (stride === -1) {
            return undefined;
        }

        // Obtaining combined line

        const endIndex = index + (stride - 1);
        const command = ConstructUtil.mergeCommands(tokens, index, endIndex);

        // Obtaining variable, value and side comment

        const variable = StatementUtil.getProperty(command);
        const values = Variable.getVariableValue(command);
        const sideComment = ConstructUtil.getSideComment(tokens, endIndex);

        // Return Variable

        return new AstVariable(variable, values, indent, indentSize, sideComment);
    }
}
