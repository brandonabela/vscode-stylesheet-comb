import { AstStatement } from "../ast-statement";
import { AstUtil } from "../ast-util";
import { AstComment } from "./ast-comment";

export class AstProperty extends AstStatement {
    constructor(
        public property: string,
        public value: string,
        public indent: string,
        public sideComment?: AstComment
    ) {
        super(indent);
    }

    toString(): string {
        return this.indent + this.property + ': ' + this.value + ';' + AstUtil.getSideComment(this.sideComment);
    }
}
