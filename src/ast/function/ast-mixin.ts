import { AstFunction } from "../ast-function";
import { AstNode } from "../ast-node";
import { AstUtil } from "../ast-util";
import { AstComment } from "../statement/ast-comment";

export class AstMixin extends AstFunction {
    constructor(
        public mixinName: string,
        public parameters: string,
        public properties: AstNode[],
        public indent: string,
        public sideComment?: (AstComment | undefined),
        public endComment?: AstComment
    ) {
        super(properties, indent, endComment);
    }

    toStringHead(): string {
        return this.indent + this.mixinName + '(' + this.parameters + ') {' + AstUtil.getSideComment(this.sideComment) + '\n';
    }

    toStringTail(): string {
        return this.indent + '}' + AstUtil.getSideComment(this.endComment);
    }
}
