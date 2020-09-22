import { AstFunction } from "../ast-function";
import { AstNode } from "../ast-node";
import { AstUtil } from "../ast-util";
import { AstComment } from "../statement/ast-comment";

export class AstSelector extends AstFunction {
    constructor(
        public selectors: string[],
        public properties: AstNode[],
        public indent: string,
        public sideComment?: (AstComment | undefined)[],
        public endComment?: AstComment
    ) {
        super(properties, indent, endComment);
    }

    private getSideComment(index: number): string {
        return this.sideComment !== undefined && this.sideComment[index] !== undefined ? ' ' + this.sideComment[index] : '';
    }

    private getSelector(index: number): string {
        const selectorLength = this.selectors.length;

        const selector = this.selectors[index].toString();
        const selectorComma = (index !== selectorLength - 1 ? ',' : '');

        return selector + selectorComma + this.getSideComment(index);
    }

    private getSelectors(): string {
        return this.selectors.map((_, index) => this.indent + this.getSelector(index)).join('\n');
    }

    private getLastSideComment(): string {
        return this.sideComment !== undefined ? this.getSideComment(this.sideComment.length - 1) : '';
    }

    toStringHead(): string {
        return this.getSelectors() + ' {' + this.getLastSideComment() + '\n';
    }

    toStringTail(): string {
        return this.indent + '}' + AstUtil.getSideComment(this.endComment);
    }
}
