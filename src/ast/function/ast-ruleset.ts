import { AstFunction } from "../ast-function";
import { AstNode } from "../ast-node";
import { AstUtil } from "../ast-util";
import { AstComment } from "../statement/ast-comment";

export class AstRuleset extends AstFunction {
    constructor(
        public properties: AstNode[],
        public indent: string,
        public sideComment?: AstComment,
        public endComment?: AstComment
    ) {
        super(properties, indent, endComment);
    }

    toStringHead(): string {
        return this.indent + '@detached-ruleset: {' + AstUtil.getSideComment(this.sideComment) + '\n';
    }

    toStringTail(): string {
        return this.indent + '};' + AstUtil.getSideComment(this.endComment);
    }
}
