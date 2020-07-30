import * as vscode from 'vscode';
import { StyleComb } from './style-comb';

const EXTENSIONS = [
	'css',
	'less'
];

function languageSupported(languageId: string) {
	return EXTENSIONS.includes(languageId);
}

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('extension.vscode-style-comb', () => {
		const { activeTextEditor } = vscode.window;

		if (activeTextEditor && languageSupported(activeTextEditor.document.languageId)) {
			const { document } = activeTextEditor;

			const tabSize = activeTextEditor.options.tabSize as number;
			const spaceStatus = activeTextEditor.options.insertSpaces as boolean;

			const formattedDocument = StyleComb.styleComb(document, tabSize, spaceStatus);

			const edit = new vscode.WorkspaceEdit();

			for (let i = 0; i < document.lineCount; i++) {
				const line = document.lineAt(i);
				edit.replace(document.uri, line.range, formattedDocument[i]);
			}

			return vscode.workspace.applyEdit(edit);
		}
	});
}
