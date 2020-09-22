import { AstSelector } from "../ast/function/ast-selector";
import { AstComment } from "../ast/statement/ast-comment";
import { ConstructUtil } from "../construct-util/construct-util";
import { Comment } from "./comment";

export class Selector {
    static openSelectorStride(tokens: string[], index: number): number {
        // Obtain command based on the current index

        let command = ConstructUtil.getCommand(tokens[index]);

        if (command.indexOf('{') === -1 || command.indexOf('@') !== -1) {
            return -1;
        }

        // Determine if the open curly bracket is alone

        const allowedSkips = command.trim() === '{' ? 1 : 0;

        // Reverse loop through the tokens until comma is not found

        let stride = index;

        for (let i = index - 1 - allowedSkips; i >= 0; i--) {
            command = ConstructUtil.getCommand(tokens[i]);

            if (command.indexOf(',') === -1) {
                stride = (index - 1) - i;
                break;
            }
        }

        // Return the selector stride

        return stride;
    }

    static openSelectorLastCommentStride(tokens: string[], index: number): number {
        return Comment.commentStride(tokens, index);
    }

    static getSelectors(tokens: string[], startIndex: number, endIndex: number): string[] {
        const selectors = [];

        // Loop from start to end index

        for (let i = startIndex; i < endIndex + 1; i++) {
            const command = ConstructUtil.getCommand(tokens[i]).trim();

            const lastCharacter = command.substr(-1);
            const lastCommaPosition = command.lastIndexOf(',');
            const lastCurlyPosition = command.lastIndexOf('{');

            // Check if line contains commas or if open curly in current line

            if (lastCommaPosition !== -1) {
                const selector = command.substring(0, lastCommaPosition).trim();
                selectors.push(selector);
            } else if (lastCurlyPosition > 1 && lastCharacter === '{') {
                const selector = command.substring(0, lastCurlyPosition).trim();
                selectors.push(selector);
            } else if (command.trim() !== '{') {
                selectors.push(command.trim());
            }
        }

        // Return selectors

        return selectors;
    }

    static getSelectorsComment(tokens: string[], startIndex: number, endIndex: number): (AstComment | undefined)[] {
        const comments = [];

        for (let i = startIndex; i < endIndex + 1; i++) {
            // Updating token value

            const line = tokens[i];
            tokens[i] = ConstructUtil.getComment(line);

            // Constructing side comment and append side comment

            const sideComment = Comment.constructComment(tokens, i, '');
            comments.push(sideComment);

            // Resetting token value

            tokens[i] = line;
        }

        // Return side comment

        return comments;
    }

    static constructOpenSelector(tokens: string[], index: number, indent: string = ''): AstSelector | undefined {
        // Return undefined if not a selector

        const stride = Selector.openSelectorStride(tokens, index);

        if (stride === -1) {
            return undefined;
        }

        // Obtaining start and end positions of selector

        const startIndex = index - stride;
        const endIndex = index;

        // Extracting selectors and comments

        const selectors = this.getSelectors(tokens, startIndex, endIndex);
        const comments = this.getSelectorsComment(tokens, startIndex, endIndex);

        // Return Selector

        return new AstSelector(selectors, [], indent, comments);
    }
}
