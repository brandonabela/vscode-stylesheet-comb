import { AstFunction } from '../ast/ast-function';
import { AstNode } from '../ast/ast-node';
import { AstStatement } from '../ast/ast-statement';
import { AstComment } from '../ast/statement/ast-comment';
import { AstProperty } from '../ast/statement/ast-property';
import { AstUnclassified } from '../ast/statement/ast-unclassified';
import { FunctionUtil } from '../construct-util/function-util';
import * as GROUPS from './../json/grouping.json';
import { CombGroup } from './comb-group';

export class Combing {
    static getOtherComb(index: number) {
        return new CombGroup(index, GROUPS.length, 0);
    }

    static getCombGroup(index: number, astProperty: AstProperty): CombGroup {
        const propertyName = astProperty.property;
        const groupIndices = GROUPS.map((group, index) => group.indexOf(propertyName) !== -1 ? index : -1);

        // Remove non zeros

        const validGroups = groupIndices.filter(index => index !== -1);

        // If no valid groups return the other combing data

        if (validGroups.length === 0) {
            return Combing.getOtherComb(index);
        }

        // Find group and property indices

        const groupIndex = groupIndices.filter(index => index !== -1)[0];
        const fieldIndex = GROUPS[groupIndex].indexOf(propertyName);

        // Return Combing Group

        return new CombGroup(index, groupIndex, fieldIndex);
    }

    static reorderFields(combGroups: CombGroup[], properties: AstNode[]): AstNode[] {
        let reorderFields: AstNode[] = [];

        // Loop through every comb groups

        for (let i = 0; i < combGroups.length; i++) {
            // If the group index changed from previous add empty line

            if (i !== 0 && combGroups[i - 1].groupIndex !== combGroups[i].groupIndex) {
                reorderFields.push(new AstUnclassified('', ''));
            }

            // Adding nodes based sorted comb group

            const reorderIndex = combGroups[i].nodeIndex;
            reorderFields.push(properties[reorderIndex]);
        }

        // Return the reordered fields

        return reorderFields;
    }

    static combFunction(astFunction: AstFunction): AstNode {
        let combGroups: CombGroup[] = [];

        const properties = astFunction.properties;

        // Loop through every property

        for (let i = 0; i < properties.length; i++) {
            let property = properties[i];

            // Move comment together with property hence it needs to be the same group number

            if (property instanceof AstComment && i + 1 !== properties.length && properties[i + 1] instanceof AstProperty) {
                const astProperty = properties[i + 1] as AstProperty;

                const combGroup = Combing.getCombGroup(i, astProperty);
                combGroups.push(combGroup);
            } else if (property instanceof AstProperty) {
                const astProperty = property as AstProperty;

                const combGroup = Combing.getCombGroup(i, astProperty);
                combGroups.push(combGroup);
            } else if (property instanceof AstStatement) {
                const combGroup = Combing.getOtherComb(i);
                combGroups.push(combGroup);
            } else {
                const astFunction = property as AstFunction;
                property = this.combFunction(astFunction);

                const combGroup = Combing.getOtherComb(i);
                combGroups.push(combGroup);
            }
        }

        // Sorting the comb groups

        combGroups.sort((a, b) => {
            return a.groupIndex - b.groupIndex || a.fieldIndex - b.fieldIndex;
        });

        // Reordering function properties

        astFunction.properties = Combing.reorderFields(combGroups, properties);

        // Returning the modified ast function

        return astFunction;
    }

    static combStylesheet(stylesheet: AstNode[]): AstNode[] {
        let astComb: AstNode[] = [];

        // Loop through the stylesheet nodes

        for (let i = 0; i < stylesheet.length; i++) {
            if (FunctionUtil.isFunction(stylesheet, i)) {
                const astFunction = stylesheet[i] as AstFunction;

                const combAstFunction = Combing.combFunction(astFunction);
                astComb.push(combAstFunction);
            } else {
                astComb.push(stylesheet[i]);
            }
        }

        // Return comb nodes

        return astComb;
    }
}
