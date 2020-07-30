import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { StyleComb } from '../../style-comb';

class TestCase {
	constructor(
		public testName: string,
		public inputPath: string,
		public outputPath: string
	) { }
}

const testCases: TestCase[] = [
	new TestCase('CSS Program 01', 'css/in-css-01.css', 'css/out-css-01.css'),
	new TestCase('CSS Program 02', 'css/in-css-02.css', 'css/out-css-02.css'),
	new TestCase('CSS Program 03', 'css/in-css-03.css', 'css/out-css-03.css'),
	new TestCase('LESS Program 01', 'less/in-less-01.less', 'less/out-less-01.less'),
	new TestCase('LESS Program 02', 'less/in-less-02.less', 'less/out-less-02.less'),
	new TestCase('LESS Program 03', 'less/in-less-03.less', 'less/out-less-03.less'),
	// new TestCase('SASS Program 01', 'sass/in-sass-01.sass', 'sass/out-sass-01.sass'),
	// new TestCase('SASS Program 02', 'sass/in-sass-02.sass', 'sass/out-sass-02.sass'),
	// new TestCase('SASS Program 03', 'sass/in-sass-03.sass', 'sass/out-sass-03.sass'),
	// new TestCase('SCSS Program 01', 'scss/in-scss-01.scss', 'scss/out-scss-01.scss'),
	// new TestCase('SCSS Program 02', 'scss/in-scss-02.scss', 'scss/out-scss-02.scss'),
	// new TestCase('SCSS Program 03', 'scss/in-scss-03.scss', 'scss/out-scss-03.scss')
];

const rootPath = path.join(__dirname, '../../../src/test/suite');

suite('Formatting Style Sheets', () => {
	function setupTestCase(testCase: TestCase): Thenable<any> {
		const inputUri = vscode.Uri.file(path.join(rootPath, testCase.inputPath));
		const outputUri = vscode.Uri.file(path.join(rootPath, testCase.outputPath));

		return vscode.workspace.openTextDocument(inputUri).then((inputDocument) => {
			return vscode.workspace.openTextDocument(outputUri).then((outputDocument) => {
				return vscode.window.showTextDocument(outputDocument).then(activeTextEditor => {
					const tabSize = activeTextEditor.options.tabSize as number;
					const spaceStatus = activeTextEditor.options.insertSpaces as boolean;

					const formattedDocument = StyleComb.styleComb(inputDocument, tabSize, spaceStatus);

					for (let i = 0; i < formattedDocument.length; i++) {
						assert.equal(
							formattedDocument[i],
							outputDocument.lineAt(i).text
						);
					}

					return Promise.resolve();
				}, (error) => {
					assert.fail('Error: ' + error);
				});
			}, (error) => {
				assert.fail('Error: ' + error);
			});
		}, (error) => {
			assert.fail('Error: ' + error);
		});
	}

	testCases.forEach(testCase => {
		test(testCase.testName, (done) => {
			setupTestCase(testCase).then(() => done(), done);
		});
	});
});
