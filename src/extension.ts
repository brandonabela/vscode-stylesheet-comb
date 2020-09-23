import * as vscode from 'vscode';
import { StyleComb } from './style-comb';

const EXTENSIONS = [
	'css',
	'less',
	'sass',
	'scss'
];

function languageSupported(languageId: string): boolean {
	return EXTENSIONS.includes(languageId);
}

function getFullRange(document: vscode.TextDocument): vscode.Range {
	const firstLine = document.lineAt(0);
	const lastLine = document.lineAt(document.lineCount - 1);

	return new vscode.Range(0, firstLine.range.start.character, document.lineCount - 1, lastLine.range.end.character);
}

function applyFormat(document: vscode.TextDocument): string {
	const { activeTextEditor } = vscode.window;

	if (activeTextEditor) {
		const tabSize = activeTextEditor.options.tabSize as number;
		const spaceStatus = activeTextEditor.options.insertSpaces as boolean;

		return StyleComb.styleComb(document, tabSize, spaceStatus).join('\n');
	}

	return '';
}

export function activate() {
	vscode.commands.registerCommand('extension.vscode-style-comb', () => {
		const { activeTextEditor } = vscode.window;

		if (activeTextEditor && languageSupported(activeTextEditor.document.languageId)) {
			const { document } = activeTextEditor;

			const edit = new vscode.WorkspaceEdit();

			const range = getFullRange(document);
			const formattedDocument = applyFormat(document);

			edit.replace(document.uri, range, formattedDocument);
			return vscode.workspace.applyEdit(edit);
		}
	});

	let formatProvider = {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			const { activeTextEditor } = vscode.window;

			if (activeTextEditor) {
				const range = getFullRange(document);
				const formattedDocument = applyFormat(document);

				return [vscode.TextEdit.replace(range, formattedDocument)];
			}

			return [];
		}
	};

	EXTENSIONS.forEach(extension => {
		vscode.languages.registerDocumentFormattingEditProvider(extension, formatProvider);
	});
}

export function deactivate() { }
