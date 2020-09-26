import { AstNode } from "../ast/ast-node";
import { AstUnclassified } from "../ast/statement/ast-unclassified";
import { Comment } from "../construct/comment";
import { Include } from "../construct/include";
import { Loop } from "../construct/loop";
import { Mixin } from "../construct/mixin";
import { MixinCall } from "../construct/mixin-call";
import { Property } from "../construct/property";
import { Ruleset } from "../construct/ruleset";
import { Selector } from "../construct/selector";
import { Variable } from "../construct/variable";

export class Categories {
    static getCategories(tokens: string[]): AstNode[] {
        let categories: AstNode[] = [];

        for (let i = 0; i < tokens.length; i++) {
            // Start with skip stride set to 1

            let skipStride = 1;

            // Attempt to create every possible category

            const loop = Loop.constructOpenLoop(tokens, i);
            const mixin = Mixin.constructOpenMixin(tokens, i);
            const ruleset = Ruleset.constructRuleset(tokens, i);
            const selector = Selector.constructOpenSelector(tokens, i);
            const variable = Variable.constructVariable(tokens, i);
            const mixinCall = MixinCall.constructMixinCall(tokens, i);
            const property = Property.constructProperty(tokens, i);
            const include = Include.constructInclude(tokens, i);
            const comment = Comment.constructComment(tokens, i);
            const unclassified = new AstUnclassified(tokens[i], '');

            // Add the first valid category hence order of if statements is important

            if (loop !== undefined) {
                skipStride = Loop.openLoopTotalStride(tokens, i);
                categories.push(loop);
            } else if (mixin !== undefined) {
                skipStride = Mixin.openMixinTotalStride(tokens, i);
                categories.push(mixin);
            } else if (ruleset !== undefined) {
                skipStride = Ruleset.openRulesetTotalStride(tokens, i);
                categories.push(ruleset);
            } else if (selector !== undefined) {
                const deleteStride = Selector.openSelectorStride(tokens, i);
                categories.splice(categories.length - deleteStride, deleteStride);

                skipStride = Selector.openSelectorLastCommentStride(tokens, i);
                categories.push(selector);
            } else if (variable !== undefined) {
                skipStride = Variable.variableTotalStride(tokens, i);
                categories.push(variable);
            } else if (mixinCall !== undefined) {
                skipStride = MixinCall.mixinCallTotalStride(tokens, i);
                categories.push(mixinCall);
            } else if (property !== undefined) {
                skipStride = Property.propertyTotalStride(tokens, i);
                categories.push(property);
            } else if (include !== undefined) {
                skipStride = Include.includeTotalStride(tokens, i);
                categories.push(include);
            } else if (comment !== undefined) {
                skipStride = Comment.commentStride(tokens, i);
                categories.push(comment);
            } else if (tokens[i].trim() !== '') {
                categories.push(unclassified);
            }

            // Skipping lines based on the category stride

            i += skipStride !== -1 ? (skipStride - 1) : 0;
        }

        // Return categories

        return categories;
    }
}