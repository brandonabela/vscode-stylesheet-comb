import { AstStatement } from "../ast-statement";
import { AstUtil } from "../ast-util";
import { AstComment } from "./ast-comment";

export class AstInclude extends AstStatement {
    constructor(
        public line: string,
        public indent: string,
        public sideComment?: AstComment
    ) {
        super(indent);
    }

    toString(): string {
        return this.indent + this.line + ';' + AstUtil.getSideComment(this.sideComment);
    }
}
