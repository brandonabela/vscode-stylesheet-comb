import { AstStatement } from "../ast-statement";
import { AstUtil } from "../ast-util";
import { AstComment } from "./ast-comment";

export class AstMixinCall extends AstStatement {
    constructor(
        public mixinName: string,
        public parameters: string,
        public indent: string,
        public sideComment?: AstComment
    ) {
        super(indent);
    }

    toString(): string {
        return this.indent + this.mixinName + '(' + this.parameters + ');' + AstUtil.getSideComment(this.sideComment);
    }
}
