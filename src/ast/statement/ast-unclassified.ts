import { AstStatement } from "../ast-statement";

export class AstUnclassified extends AstStatement {
    constructor(
        public line: string,
        public indent: string
    ) {
        super(indent);
    }

    toString(): string {
        return this.indent + this.line;
    }
}
