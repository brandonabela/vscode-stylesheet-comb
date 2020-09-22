import { AstNode } from "../ast/ast-node";
import { AstUnclassified } from "../ast/statement/ast-unclassified";
import { ConstructUtil } from "../construct-util/construct-util";
import { Comment } from "./comment";

export class Unclassified {
    static isUnclassified(categories: AstNode[], index: number): boolean {
        return categories[index] instanceof AstUnclassified;
    }

    static unclassifiedStride(categories: AstNode[], index: number): number {
        for (let i = index + 1; i < categories.length; i++) {
            if (!this.isUnclassified(categories, i)) {
                return i - index;
            }
        }

        return (categories.length + 1) - index;
    }

    static getUnclassified(categories: AstNode[], index: number): string[] {
        // Get a stride of unclassified

        const stride = Unclassified.unclassifiedStride(categories, index);
        const unclassified = categories.slice(index, index + stride);

        // Return a list of strings

        return unclassified.map(x => x.toString());
    }

    static commentStride(categories: AstNode[], index: number): number {
        // Update category with comment

        const node = categories[index];

        const comment = ConstructUtil.getComment(node.toString());
        categories[index] = new AstUnclassified(comment, '');

        // Retrieve a stride of unclassified

        const unclassified = Unclassified.getUnclassified(categories, index);

        // Retrieve comment stride

        const stride = Comment.commentStride(unclassified, 0);

        // Resetting the original line

        categories[index] = node;

        // Returning comment stride

        return stride;
    }
}
