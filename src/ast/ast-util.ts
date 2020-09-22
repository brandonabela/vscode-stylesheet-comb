import { AstFunction } from "./ast-function";
import { AstStatement } from "./ast-statement";
import { AstComment } from "./statement/ast-comment";

export class AstUtil {
    static getProperties(properties: (AstStatement | AstFunction)[]): string {
        return properties !== undefined ? properties.map(property => property.toString()).join('\n') + '\n' : '';
    }

    static getSideComment(sideComment: AstComment | undefined): string {
        return sideComment !== undefined ? ' ' + sideComment.toString() : '';
    }
}
