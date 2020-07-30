import * as vscode from 'vscode';

export class StyleComb {
    static styleComb(document: vscode.TextDocument, tabSize: number, isSpaces: boolean): string[] {
        const unformattedFile = this.readDocument(document);
        const formattedFile = StyleComb.formatDocument(unformattedFile, tabSize, isSpaces);

        return formattedFile;
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

    static formatDocument(unformattedFile: string[], tabSize: number, isSpaces: boolean): string[] {
        let formattedFile: string[] = [];

        formattedFile = this.removeDoubleSpacing(unformattedFile);

        formattedFile = this.splitOpenCurly(formattedFile);
        formattedFile = this.splitCloseCurly(formattedFile);

        formattedFile = this.splitProperties(formattedFile);
        formattedFile = this.splitClasses(formattedFile);
        formattedFile = this.splitVariables(formattedFile);
        formattedFile = this.splitComments(formattedFile);

        formattedFile = this.mergeProperty(formattedFile);
        formattedFile = this.formatProperty(formattedFile);
        formattedFile = this.indentFile(formattedFile, tabSize, isSpaces);

        return formattedFile;
    }

    static getLineCommand(line: string): string {
        let singleCommentPosition = line.indexOf('//');
        let multiCommentPosition = line.indexOf('/*');

        if (singleCommentPosition !== -1 || multiCommentPosition !== -1) {
            return line.substring(0, Math.max(singleCommentPosition, multiCommentPosition));
        }

        return line;
    }

    static getLineComment(line: string): string {
        let singleCommentPosition = line.indexOf('//');
        let multiCommentPosition = line.indexOf('/*');

        if (singleCommentPosition !== -1 || multiCommentPosition !== -1) {
            return line.substring(Math.max(singleCommentPosition, multiCommentPosition));
        }

        return '';
    }

    static insert(array: any[], index: number, insertArray: any[], withReplace: boolean = true): any[] {
        return [
            ...array.slice(0, index),
            ...insertArray,
            ...array.slice(index + (withReplace ? 1 : 0))
        ];
    }

    static split(line: string, delimiter: string, preSpace: boolean = false, postSpace: boolean = false): string[] {
        let command = this.getLineCommand(line).trim();
        let comment = this.getLineComment(line).trim();

        let commands = command.split(delimiter);
        commands = commands.map((line) => line.trim());

        for (let i = 0; i < commands.length - 1; i++) {
            commands[i] += (preSpace ? ' ' : '') + delimiter + (postSpace ? ' ' : '');
        }

        if (commands[commands.length - 1] === '') {
            commands.pop();
        }

        if (comment !== '') {
            commands[commands.length - 1] += ' ' + comment;
        }

        return commands;
    }

    static removeDoubleSpacing(document: string[]): string[] {
        for (let i = 0; i < document.length; i++) {
            document[i] = document[i].replace(/\s+/g, ' ');
        }

        return document;
    }

    static splitOpenCurly(document: string[]): string[] {
        for (let i = 0; i < document.length; i++) {
            let command = this.getLineCommand(document[i]).trim();

            let openCurlyPosition = command.indexOf('{');

            if (openCurlyPosition !== -1) {
                const splitOpenCurly = this.split(document[i], '{', true);

                document = this.insert(document, i, splitOpenCurly);
                i += (splitOpenCurly.length - 1);
            } else if (command !== '' && i < document.length - 1) {
                let nextCommand = this.getLineCommand(document[i + 1]).trim();

                let nextOpenCurlyPosition = nextCommand.indexOf('{');

                if (nextOpenCurlyPosition !== -1) {
                    document[i] = [document[i], document[i + 1]].join('');

                    document.splice(i + 1, 1);
                    i--;
                }
            }
        }

        return document;
    }

    static splitCloseCurly(document: string[]): string[] {
        for (let i = 0; i < document.length; i++) {
            let command = this.getLineCommand(document[i]).trim();

            let semicolonPosition = command.indexOf(';');
            let closeCurlyPosition = command.indexOf('}');

            let positionDifference = semicolonPosition - closeCurlyPosition;

            let delimiter = '}';

            if (closeCurlyPosition !== -1 && 0 < positionDifference && positionDifference <= 2) {
                delimiter = '};';

                document[i] = document[i].substring(0, closeCurlyPosition) +
                    document[i].substring(closeCurlyPosition, semicolonPosition + 1).replace(/\s+/g, '') +
                    document[i].substring(semicolonPosition + 1, document[i].length);
            }

            if (closeCurlyPosition !== -1) {
                let splitCloseCurly = this.split(document[i], delimiter);

                document = this.insert(document, i, splitCloseCurly);
                i += (splitCloseCurly.length - 1);
            }
        }

        for (let i = 0; i < document.length - 1; i++) {
            let command = this.getLineCommand(document[i]).trim();
            let nextCommand = this.getLineCommand(document[i + 1]).trim();

            let closeCurlyPosition = command.indexOf('}');

            if (closeCurlyPosition !== -1 && nextCommand !== '}') {
                document = this.insert(document, i + 1, [''], false);
                i++;
            }
        }

        return document;
    }

    static splitProperties(document: string[]): string[] {
        for (let i = 0; i < document.length; i++) {
            let command = this.getLineCommand(document[i]).trim();

            let semicolonPosition = command.indexOf(';');

            if (semicolonPosition !== -1) {
                const splitProperties = this.split(document[i], ';');

                document = this.insert(document, i, splitProperties);
                i += (splitProperties.length - 1);
            }
        }

        return document;
    }

    static splitClasses(document: string[]): string[] {
        for (let i = 0; i < document.length; i++) {
            let command = this.getLineCommand(document[i]).trim();

            let commaPosition = command.indexOf(',');
            let openCurlyPosition = command.indexOf('{');
            let closeCurlyPosition = command.indexOf('}');

            if (commaPosition !== -1 && (commaPosition < openCurlyPosition || commaPosition < closeCurlyPosition)) {
                const splitClasses = this.split(document[i], ',');

                document = this.insert(document, i, splitClasses);
                i += (splitClasses.length - 1);
            }
        }

        return document;
    }

    static splitVariables(document: string[]): string[] {
        for (let i = 0; i < document.length - 1; i++) {
            let command = this.getLineCommand(document[i]).trim();
            let nextCommand = this.getLineCommand(document[i + 1]).trim();

            let atPosition = command.indexOf('@');
            let colonPosition = command.indexOf(':');

            let nextAtPosition = nextCommand.indexOf('@');
            let nextColonPosition = nextCommand.indexOf(':');

            if (atPosition !== -1 && atPosition < colonPosition && document[i + 1] !== '' && nextAtPosition === -1 && nextColonPosition === -1) {
                document = this.insert(document, i + 1, [''], false);
                i++;
            }
        }

        return document;
    }

    static splitComments(document: string[]): string[] {
        for (let i = 1; i < document.length; i++) {
            let command = this.getLineCommand(document[i]).trim();
            let comment = this.getLineComment(document[i]).trim();

            let prevCommand = this.getLineCommand(document[i - 1]).trim();

            let prevSemicolonPosition = prevCommand.indexOf(';');

            if (command === '' && comment !== '' && prevSemicolonPosition !== -1) {
                document = this.insert(document, i, [''], false);
                i++;
            }
        }

        return document;
    }

    static mergeProperty(document: string[]): string[] {
        for (let i = 0; i < document.length - 1; i++) {
            let command = this.getLineCommand(document[i]).trim();

            let colonPosition = command.indexOf(':');
            let semicolonPosition = command.indexOf(';');

            if (colonPosition !== -1 && semicolonPosition === -1) {
                let nextCommand = this.getLineCommand(document[i + 1]).trim();
                let nextComment = this.getLineComment(document[i + 1]).trim();

                let nextColonPosition = nextCommand.indexOf(':');
                let nextSemicolonPosition = nextCommand.indexOf(';');

                if (nextColonPosition === -1 && nextSemicolonPosition !== -1) {
                    document[i] = command + ' ' + nextCommand + (nextComment !== '' ? ' ' + nextComment : '');

                    document.splice(i + 1, 1);
                    i--;
                }
            }
        }

        return document;
    }

    static formatProperty(document: string[]): string[] {
        for (let i = 0; i < document.length; i++) {
            let command = this.getLineCommand(document[i]).trim();
            let comment = this.getLineComment(document[i]).trim();

            let colonPosition = command.indexOf(':');
            let semicolonPosition = command.indexOf(';');
            let openCurlyPosition = command.indexOf('{');
            let closeCurlyPosition = command.indexOf('}');

            if (colonPosition !== -1 && openCurlyPosition === -1 && closeCurlyPosition === -1) {
                let propertyName = command.substring(0, colonPosition + 1).trim();
                let propertyValue = command.substring(colonPosition + 1).trim();

                let commaPosition = propertyValue.indexOf(',');
                let openRoundPosition = propertyValue.indexOf('(');
                let closeRoundPosition = propertyValue.indexOf(')');

                if (commaPosition !== -1 && openRoundPosition < closeRoundPosition) {
                    propertyValue = this.split(propertyValue, ',', false, true).join('');
                }

                document[i] = propertyName + ' ' + propertyValue + (semicolonPosition === -1 ? ';' : '') + (comment !== '' ? ' ' + comment : '');
            }
        }

        return document;
    }

    static indentFile(document: string[], tabSize: number, isSpaces: boolean): string[] {
        let indent = 0;

        for (let i = 0; i < document.length; i++) {
            let command = this.getLineCommand(document[i]).trim();

            let openCurlyPosition = command.indexOf('{');
            let closeCurlyPosition = command.indexOf('}');

            if (closeCurlyPosition !== -1) {
                indent -= tabSize;
            }

            if (document[i] !== '') {
                document[i] = (isSpaces ? ' ' : '\t').repeat(indent) + document[i];
            }

            if (openCurlyPosition !== -1) {
                indent += tabSize;
            }
        }

        return document;
    }
}