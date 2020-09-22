export abstract class AstNode {
    constructor(
        public indent: string
    ) { }

    abstract toString(): string;
}
