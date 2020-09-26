import * as vscode from 'vscode';
import { AstFunction } from './ast/ast-function';
import { AstNode } from './ast/ast-node';
import { AstComment } from './ast/statement/ast-comment';
import { AstUnclassified } from './ast/statement/ast-unclassified';
import { Combing } from './combing/combing';
import { FunctionUtil } from './construct-util/function-util';
import { Comment } from './construct/comment';
import { Include } from './construct/include';
import { Loop } from './construct/loop';
import { Mixin } from './construct/mixin';
import { MixinCall } from './construct/mixin-call';
import { Property } from './construct/property';
import { Ruleset } from './construct/ruleset';
import { Selector } from './construct/selector';
import { Unclassified } from './construct/unclassified';
import { Variable } from './construct/variable';
import { StyleUtil } from './style-util';

export class StyleComb {
    static styleComb(vsFile: vscode.TextDocument, tabSize: number, isSpaces: boolean): string[] {
        const document = this.readFile(vsFile);
        const tokens = this.tokenise(document);

        const categories = this.getCategories(tokens);
        const stylesheet = this.getStylesheet(categories, tabSize, isSpaces);
        const combing = Combing.combStylesheet(stylesheet);

        return this.separateNodes(combing).split('\n');
    }

    static readFile(vsFile: vscode.TextDocument): string[] {
        let inBlockComment = false;
        let document: string[] = [];

        for (let i = 0; i < vsFile.lineCount; i++) {
            // Read line and trim extra spaces from the right

            const line = vsFile.lineAt(i).text.trimRight();

            // Keep new lines within block comment only

            if (line.indexOf('/*') !== -1) {
                inBlockComment = true;
            }

            if (line.indexOf('*/') !== -1) {
                inBlockComment = false;
            }

            if (inBlockComment || line !== '') {
                document.push(line);
            }
        }

        // Return document

        return document;
    }

    static tokenise(document: string[]): string[] {
        let tokens = document;

        tokens = StyleUtil.splitBlockComments(tokens);

        tokens = StyleUtil.splitArray(tokens, '{', true, ['@', '#']);
        tokens = StyleUtil.splitArray(tokens, '}', false, [',', '-']);
        tokens = StyleUtil.splitArray(tokens, '(', false);
        tokens = StyleUtil.splitArray(tokens, ')', false, [';']);
        tokens = StyleUtil.splitArray(tokens, ',', false);
        tokens = StyleUtil.splitArray(tokens, ';', false);

        return tokens;
    }

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

    static getStylesheet(categories: AstNode[], tabSize: number, isSpaces: boolean): AstNode[] {
        let ast: AstNode[] = [];

        for (let i = 0; i < categories.length; i++) {
            // Start with skip stride set to 1

            let skipStride = 1;

            // Add the first valid category implying that the order of the if statements is important

            const astFunction = FunctionUtil.constructFunction(categories, i, tabSize, isSpaces);

            if (astFunction !== undefined) {
                skipStride = FunctionUtil.functionTotalStride(categories, i);
                ast.push(astFunction);
            } else if (Variable.isVariable(categories, i)) {
                const indentSize = FunctionUtil.getIndent(tabSize, isSpaces, 1);
                const variable = FunctionUtil.getVariable(categories, i, '', indentSize);
                ast.push(variable);
            } else if (Unclassified.isUnclassified(categories, i)) {
                const unclassified = categories[i] as AstUnclassified;
                unclassified.line = unclassified.line.trim();
                ast.push(unclassified);
            } else {
                ast.push(categories[i]);
            }

            // Skipping lines based on the category stride

            i += skipStride !== -1 ? (skipStride - 1) : 0;
        }

        // Return ast

        return ast;
    }

    static needDoubleNewLine(stylesheet: AstNode[], index: number): boolean {
        // Check if next element is present

        const hasNextElement = index < stylesheet.length - 1;

        if (hasNextElement) {
            // Certain elements should not be separated by an enter

            const twoInclude = Include.isInclude(stylesheet, index) && Include.isInclude(stylesheet, index + 1);
            const twoMixinCall = MixinCall.isMixinCall(stylesheet, index) && MixinCall.isMixinCall(stylesheet, index + 1);
            const twoProperty = Property.isProperty(stylesheet, index) && Property.isProperty(stylesheet, index + 1);
            const twoUnclassified = Unclassified.isUnclassified(stylesheet, index) && Unclassified.isUnclassified(stylesheet, index + 1);
            const twoVariables = Variable.isVariable(stylesheet, index) && Variable.isVariable(stylesheet, index + 1);

            // Check if current and next elements are line comments

            if (Comment.isComment(stylesheet, index) && Comment.isComment(stylesheet, index + 1)) {
                const currentComment = stylesheet[index] as AstComment;
                const nextComment = stylesheet[index + 1] as AstComment;

                return currentComment.isBlock && nextComment.isBlock;
            }

            return !(twoInclude || twoMixinCall || twoProperty || twoUnclassified || twoVariables);
        }

        // Return false if next element is not present

        return false;
    }

    static separateNodes(stylesheet: AstNode[]): string {
        let separatedNodes = '';

        // Loop through the stylesheet nodes

        for (let i = 0; i < stylesheet.length; i++) {
            // Check if enter is required

            const isDoubleNewLine = this.needDoubleNewLine(stylesheet, i);

            // Adding formatted node

            if (FunctionUtil.isFunction(stylesheet, i)) {
                const astFunction = stylesheet[i] as AstFunction;

                separatedNodes += astFunction.toStringHead();
                separatedNodes += StyleComb.separateNodes(astFunction.properties);
                separatedNodes += astFunction.toStringTail();
            } else {
                separatedNodes += stylesheet[i].toString();
            }

            // Do not apply new liens if node is unclassified

            if (i < stylesheet.length - 1 && Unclassified.isUnclassified(stylesheet, i + 1)) {
                const astUnclassified = stylesheet[i + 1] as AstUnclassified;

                if (astUnclassified.line === '') {
                    continue;
                }
            }

            // Adding double new line if required

            separatedNodes += isDoubleNewLine ? '\n\n' : '\n';
        }

        // Return separated nodes

        return separatedNodes;
    }
}
