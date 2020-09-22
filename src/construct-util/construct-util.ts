import { AstComment } from "../ast/statement/ast-comment";
import { Comment } from "../construct/comment";

export class ConstructUtil {
    static getCommentPositions(line: string): number[] {
        // Obtaining Comment Positions

        const lineCommentPosition = line.indexOf('//');
        const blockCommentPosition = line.indexOf('/*');

        // Return the valid comment positions

        return [lineCommentPosition, blockCommentPosition].filter(x => x !== -1);
    }

    static getCommand(line: string): string {
        // Return command if comment is present

        const validPositions = ConstructUtil.getCommentPositions(line);

        if (validPositions.length !== 0) {
            return line.substring(0, Math.min(...validPositions));
        }

        // Return entire line if comment is not present

        return line;
    }


    static getComment(line: string): string {
        // Return comment if comment is present

        const validPositions = ConstructUtil.getCommentPositions(line);

        if (validPositions.length !== 0) {
            return line.substring(Math.min(...validPositions));
        }

        // Return empty comment if comment is not present

        return '';
    }

    static commandIndexOf(tokens: string[], index: number, searchString: string): number {
        const command = ConstructUtil.getCommand(tokens[index]);
        return command.indexOf(searchString);
    }

    static commentIndexOf(tokens: string[], index: number, searchString: string): number {
        const comment = ConstructUtil.getComment(tokens[index]);
        return comment.indexOf(searchString);
    }

    static getStride(tokens: string[], index: number, startToken: string, endToken: string = '', isCommand: boolean = true): number {
        // Storing callback

        const callback = isCommand ? ConstructUtil.commandIndexOf : ConstructUtil.commentIndexOf;

        // If start token not present return -1

        if (callback(tokens, index, startToken) === -1) {
            return -1;
        }

        // If end token is empty return 1

        if (endToken === '') {
            return 1;
        }

        // Check if end token is in current line

        if (callback(tokens, index, endToken) !== -1) {
            return 1;
        }

        // Loop through token and if end token is present return the stride length

        for (let i = index + 1; i < tokens.length; i++) {
            if (ConstructUtil.commandIndexOf(tokens, i, endToken) !== -1) {
                return (i + 1) - index;
            }
        }

        // Return -1 if end token still not found

        return -1;
    }

    static mergeCommands(tokens: string[], startIndex: number, endIndex: number): string {
        // Retrieve a list of lines

        const lines = tokens.slice(startIndex, endIndex + 1);

        // Return a line and trim the string

        return lines.map(line => ConstructUtil.getCommand(line).trim()).join(' ');
    }

    static getSideCommentStride(tokens: string[], index: number) {
        // Updating token value

        const line = tokens[index];
        tokens[index] = ConstructUtil.getComment(line);

        // Storing comment stride

        const commentStride = Comment.commentStride(tokens, index);

        // Resetting token value

        tokens[index] = line;

        // Return Side Comment

        return commentStride !== -1 ? commentStride - 1 : 0;
    }

    static getTotalStride(tokens: string[], index: number, commandStride: number): number {
        // If node stride is not -1 find side comment stride

        if (commandStride !== -1) {
            const endIndex = index + (commandStride - 1);
            const commentStride = ConstructUtil.getSideCommentStride(tokens, endIndex);

            return commandStride + commentStride;
        }

        // Return -1 if node stride is -1

        return -1;
    }

    static getSideComment(tokens: string[], index: number): AstComment | undefined {
        // Updating token value

        const line = tokens[index];
        tokens[index] = ConstructUtil.getComment(line);

        // Update side comment if line or block comment if present

        const sideComment = Comment.constructComment(tokens, index, '');

        // Resetting token value

        tokens[index] = line;

        // Return Side Comment

        return sideComment;
    }
}
