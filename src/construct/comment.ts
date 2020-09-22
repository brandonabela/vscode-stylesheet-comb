import { AstNode } from "../ast/ast-node";
import { AstComment } from "../ast/statement/ast-comment";
import { ConstructUtil } from "../construct-util/construct-util";

export class Comment {
    static isComment(categories: AstNode[], index: number): boolean {
        return categories[index] instanceof AstComment;
    }

    private static isLineComment(tokens: string[], index: number): boolean {
        return tokens[index].indexOf('//') !== -1;
    }

    private static blockCommentStride(tokens: string[], index: number): number {
        return ConstructUtil.getStride(tokens, index, '/*', '*/', false);
    }

    static commentStride(tokens: string[], index: number): number {
        const isLineComment = Comment.isLineComment(tokens, index);
        const blockCommentStride = Comment.blockCommentStride(tokens, index);

        return isLineComment ? 1 : blockCommentStride;
    }

    private static isCommentAlone(tokens: string[], index: number): boolean {
        return ConstructUtil.getCommand(tokens[index]).trim() === '';
    }

    private static constructLineComment(tokens: string[], index: number, indent: string): AstComment | undefined {
        const linePosition = tokens[index].indexOf('//');

        if (linePosition !== -1) {
            const comment = tokens[index].substring(linePosition + 2).trim();

            return new AstComment([comment], indent, false);
        }

        return undefined;
    }

    private static constructBlockComment(tokens: string[], index: number, indent: string): AstComment | undefined {
        // Return undefined if not comment

        const blockCommentStride = Comment.blockCommentStride(tokens, index);

        if (blockCommentStride === -1) {
            return undefined;
        }

        // Obtaining block comment start and end positions

        const startIndex = index;
        const endIndex = startIndex + (blockCommentStride - 1);

        const startPosition = tokens[startIndex].indexOf('/*');
        const endPosition = tokens[endIndex].indexOf('*/');

        // Formatting the read block comment

        let comments = tokens.slice(startIndex, endIndex + 1);
        comments[comments.length - 1] = comments[comments.length - 1].substring(0, endPosition);
        comments[0] = comments[0].substring(startPosition + 3);

        for (let i = 0; i < comments.length; i++) {
            comments[i] = comments[i].trimRight();
        }

        // Removing head and trail if empty

        const headIndex = comments[0] === '' ? 1 : 0;
        const tailIndex = comments[comments.length - 1] === '' ? comments.length - 2 : comments.length - 1;

        comments = comments.slice(headIndex, tailIndex + 1);

        // Return Block Comment

        return new AstComment(comments, indent, true);
    }

    static constructComment(tokens: string[], index: number, indent: string = ''): AstComment | undefined {
        // Checking if comment is alone

        const isCommentAlone = Comment.isCommentAlone(tokens, index);

        if (!isCommentAlone) {
            return undefined;
        }

        // Constructing a line comment

        const lineComment = Comment.constructLineComment(tokens, index, indent);

        if (lineComment !== undefined) {
            return lineComment;
        }

        // Constructing a block comment

        return Comment.constructBlockComment(tokens, index, indent);
    }
}
