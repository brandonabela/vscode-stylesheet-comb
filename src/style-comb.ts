import * as vscode from 'vscode';

export class StyleComb {
    static styleComb(document: vscode.TextDocument, tabSize: number, isSpace: boolean): string[] {
        const unformattedFile = this.readDocument(document);

        return unformattedFile;
    }

    static readDocument(document: vscode.TextDocument): string[] {
        let unformattedFile: string[] = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text.trim();

            if (line !== '') {
                unformattedFile.push(line);
            }
        }

        return unformattedFile;
    }
}