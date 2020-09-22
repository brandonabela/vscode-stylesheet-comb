import { AstNode } from "./ast-node";
import { AstUtil } from "./ast-util";
import { AstComment } from "./statement/ast-comment";

export abstract class AstFunction extends AstNode {
    protected constructor(
        public properties: AstNode[],
        public indent: string,
        public endComment?: AstComment
    ) {
        super(indent);
    }

    abstract toStringHead(): string;
    abstract toStringTail(): string;

    toStringMid(): string {
        return AstUtil.getProperties(this.properties);
    }

    toString(): string {
        return this.toStringHead() + this.toStringMid() + this.toStringTail();
    }
}
