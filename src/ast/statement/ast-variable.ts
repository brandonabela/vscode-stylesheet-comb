import { AstStatement } from "../ast-statement";
import { AstUtil } from "../ast-util";
import { AstComment } from "./ast-comment";

export class AstVariable extends AstStatement {
    constructor(
        public variable: string,
        public values: string[],
        public indent: string,
        public indentSize: string,
        public sideComment?: AstComment
    ) {
        super(indent);
    }

    private getValues(): string[] {
        let depth = 0;
        let formattedValues: string[] = [];

        // Check if object variable value

        if (this.values.length === 1) {
            return [this.values[0]];
        }

        // Loop through every variable value

        for (let i = 0; i < this.values.length; i++) {
            // Retrieve the last character of the string

            let lastCharacter = this.values[i].trim().substr(-1);

            // Check if the last character is a close round bracket if so reduce depth

            if (lastCharacter === ')') {
                depth--;
            }

            // Formatting the variable value and adding it to the formatted value array

            let formattedValue = this.indent + this.indentSize.repeat(depth) + this.values[i];
            formattedValues.push(formattedValue);

            // Check if last element is a open round bracket if so increase depth

            if (lastCharacter === '(') {
                depth++;
            }
        }

        return formattedValues;
    }

    toString(): string {
        return this.indent + this.variable + ': ' + this.getValues().join('\n') + ';' + AstUtil.getSideComment(this.sideComment);
    }
}
