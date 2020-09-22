import { AstStatement } from "../ast-statement";

export class AstComment extends AstStatement {
    constructor(
        public comments: string[],
        public indent: string,
        public isBlock: boolean
    ) {
        super(indent);
    }

    private getLineComment(): string {
        return this.indent + '// ' + this.comments.join('');
    }

    private getBlockComment(): string {
        const indent = this.comments.length > 1 ? this.indent : '';

        return indent + '/*' + (this.comments.length > 1 ? '\n' : ' ') +
            this.comments.map(comment => indent + comment).join('\n') +
            (this.comments.length > 1 ? '\n' : ' ') + indent + '*/';
    }

    toString(): string {
        if (!this.isBlock) {
            return this.getLineComment();
        }

        return this.getBlockComment();
    }
}
