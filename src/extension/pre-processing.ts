import * as vscode from 'vscode';
import { ConstructUtil } from '../construct-util/construct-util';

export class PreProcessing {
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

    static getTokens(document: string[]): string[] {
        let tokens = document;

        tokens = PreProcessing.splitBlockComments(tokens);

        tokens = PreProcessing.splitArray(tokens, '{', true, ['@', '#']);
        tokens = PreProcessing.splitArray(tokens, '}', false, [',', '-']);
        tokens = PreProcessing.splitArray(tokens, '(', false);
        tokens = PreProcessing.splitArray(tokens, ')', false, [';']);
        tokens = PreProcessing.splitArray(tokens, ',', false);
        tokens = PreProcessing.splitArray(tokens, ';', false);

        return tokens;
    }

    static splitBlockComments(document: string[]): string[] {
        // Splitting every block comment

        const splitArray = document.map(line => {
            return PreProcessing.splitLine(line, '*/', true);
        });

        // Flatten multiple arrays into one array

        return ([] as string[]).concat(...splitArray);
    }

    static splitArray(document: string[], delimiter: string, preSpace: boolean = false, excludes: string[] = []): string[] {
        let inBlockComment = false;

        const splitArray = document.map(line => {
            // Updating in block comment flag

            if (line.indexOf('/*') !== -1) {
                inBlockComment = true;
            }

            if (line.indexOf('*/') !== -1) {
                inBlockComment = false;
            }

            // Storing the command and comment

            const command = ConstructUtil.getCommand(line);
            const comment = ConstructUtil.getComment(line);

            // If not in block comment performing split

            if (!inBlockComment) {
                let split = PreProcessing.splitLine(command, delimiter, preSpace, true, excludes);

                // If command and comment are not empty

                if (command !== '' && comment !== '') {
                    split[split.length - 1] += ' ' + comment;
                } else if (comment !== '') {
                    split[0] = comment;
                }

                return split;
            }

            // Return original line

            return line;
        });

        // Flatten multiple arrays into one array

        return ([] as string[]).concat(...splitArray);
    }

    static splitLine(line: string, delimiter: string, preSpace: boolean = false, addDelimiter: boolean = true, excludes: string[] = []): string[] {
        // Splitting the line based on a delimiter

        let splits = line.split(delimiter);
        splits = splits.map(line => line.trimRight());

        // Adding a space conditionally and add delimiter

        for (let i = 0; i < splits.length; i++) {
            if (i !== splits.length - 1) {
                const preDelimiter = splits[i].substr(-1);
                const postDelimiter = splits[i + 1].charAt(0);

                if (excludes.includes(preDelimiter) || excludes.includes(postDelimiter)) {
                    splits[i] += (addDelimiter ? delimiter : '');
                    splits[i] += splits[i + 1].trim();

                    splits.splice(i + 1, 1);
                    i--;
                } else {
                    splits[i] += (preSpace ? ' ' : '');
                    splits[i] += (addDelimiter ? delimiter : '');
                }
            }
        }

        // Removing any empty lines

        let lineSplit = splits;

        const startTrim = lineSplit.findIndex(x => x !== '');
        const endTrim = (lineSplit.length - 1) - lineSplit.slice().reverse().findIndex(x => x !== '');

        lineSplit = lineSplit.slice(startTrim, endTrim + 1);

        // Return line split

        return lineSplit;
    }
}