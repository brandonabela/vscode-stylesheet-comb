import * as vscode from 'vscode';
import { Categories } from './extension/categories';
import { Comb } from './extension/comb';
import { Format } from './extension/format';
import { PostProcessing } from './extension/post-processing';
import { PreProcessing } from './extension/pre-processing';

export class StyleComb {
    static styleComb(vsFile: vscode.TextDocument, tabSize: number, isSpaces: boolean): string[] {
        const document = PreProcessing.readFile(vsFile);
        const tokens = PreProcessing.getTokens(document);

        const categories = Categories.getCategories(tokens);
        const styleIndent = Format.formatStyle(categories, tabSize, isSpaces);
        const styleComb = Comb.combStyle(styleIndent);

        const styleString = PostProcessing.separateNodes(styleComb);
        const styleArray = styleString.split('\n');

        return styleArray;
    }
}
