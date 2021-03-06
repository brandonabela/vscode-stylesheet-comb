import { AstFunction } from "../ast-function";
import { AstNode } from "../ast-node";
import { AstUtil } from "../ast-util";
import { AstComment } from "../statement/ast-comment";

export class AstLoop extends AstFunction {
    constructor(
        public expression: string,
        public properties: AstNode[],
        public indent: string,
        public sideComment?: AstComment,
        public endComment?: AstComment
    ) {
        super(properties, indent, endComment);
    }

    toStringHead(): string {
        return this.indent + this.expression + ' {' + AstUtil.getSideComment(this.sideComment) + '\n';
    }

    toStringTail(): string {
        return this.indent + '}' + AstUtil.getSideComment(this.endComment);
    }
}
