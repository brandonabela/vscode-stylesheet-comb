import { StyleUtil } from "../style-util";

export class MixinUtil {
    static getMixin(command: string): string {
        // Retrieve open round bracket position

        const openRoundPosition = command.indexOf('(');

        // Returning mixin and remove double spacing

        return command.substring(0, openRoundPosition).trim().replace(/\s+/g, ' ');
    }

    static getParameterLine(command: string): string {
        // Retrieve open and close round bracket positions

        const openRoundPosition = command.indexOf('(');
        const closeRoundPosition = command.indexOf(')');

        // Retrieve parameter line

        let parameterLine = command.substring(openRoundPosition + 1, closeRoundPosition);
        parameterLine = parameterLine.split(':').join(': ');
        parameterLine = parameterLine.split(';').join('; ');
        parameterLine = parameterLine.trim().replace(/\s+/g, ' ');

        // Return the parameter line

        return parameterLine;
    }

    static getConditions(command: string): string {
        // Retrieve when, first open bracket after when keyword and open curly positions

        const whenPosition = command.indexOf('when');
        const openRoundPosition = command.indexOf('(', whenPosition + 1);
        const openCurlyPosition = command.indexOf('{');

        // Formatting conditions

        let conditionLine = command.substring(openRoundPosition, openCurlyPosition).trim();
        conditionLine = conditionLine.replace(/\s+/g, ' ');

        let conditions = StyleUtil.splitLine(conditionLine, ')', false);

        for (let i = 0; i < conditions.length; i++) {
            let openRoundPosition = conditions[i].indexOf('(');
            let closeRoundPosition = conditions[i].indexOf(')');

            if (openRoundPosition !== -1) {
                conditions[i] = conditions[i].substring(0, openRoundPosition + 1) + conditions[i].substring(openRoundPosition + 2).trim();
            }

            if (closeRoundPosition !== -1) {
                conditions[i] = conditions[i].substring(0, closeRoundPosition + 1) + conditions[i].substring(closeRoundPosition + 2).trim();
            }
        }

        // Returning conditions

        return conditions.join('');
    }
}
