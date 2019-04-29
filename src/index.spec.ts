import { createModel, toGroup } from '.';
import { expect } from 'chai';
import 'mocha';

describe('Sprida', () => {
    it('if we lack entropy for the desired number of groups we throw', () => {
        const model = createModel('a');

        const toTest = () => toGroup([1, 1], 'a', model);

        expect(toTest).to.throw();
    });

    it('create perfect groups when possible', () => {
        const model = createModel('01');

        const groups = [
            toGroup([1, 1], '00', model),
            toGroup([1, 1], '01', model),
            toGroup([1, 1], '10', model),
            toGroup([1, 1], '11', model)
        ];

        expect(groups).to.deep.equals([0, 0, 1, 1]);
    });

    it('when perfect groups can not be created the overflow goes to group 0', () => {
        const model = createModel('01');

        const groups = [
            toGroup([1, 1, 1], '00', model),
            toGroup([1, 1, 1], '01', model),
            toGroup([1, 1, 1], '10', model),
            toGroup([1, 1, 1], '11', model)
        ];

        // Observe how the last item goes to group 0.
        expect(groups).to.deep.equals([0, 1, 2, 0]);
    });

    it('group 0 gets 6/8 of the items when weights specify it', () => {
        const model = createModel('01');

        const groups = [
            toGroup([6, 2], '000', model),
            toGroup([6, 2], '001', model),
            toGroup([6, 2], '010', model),
            toGroup([6, 2], '011', model),
            toGroup([6, 2], '100', model),
            toGroup([6, 2], '101', model),
            toGroup([6, 2], '110', model),
            toGroup([6, 2], '111', model)
        ];

        expect(groups).to.deep.equals([0, 0, 0, 0, 0, 0, 1, 1]);
    });

    it('group 1 gets 6/8 of the items when weights specify it', () => {
        const model = createModel('01');

        const groups = [
            toGroup([2, 6], '000', model),
            toGroup([2, 6], '001', model),
            toGroup([2, 6], '010', model),
            toGroup([2, 6], '011', model),
            toGroup([2, 6], '100', model),
            toGroup([2, 6], '101', model),
            toGroup([2, 6], '110', model),
            toGroup([2, 6], '111', model)
        ];

        expect(groups).to.deep.equals([0, 0, 1, 1, 1, 1, 1, 1]);
    });

    it('no model gives uuid v4', () => {
        const groups = [
            toGroup([1, 1], '0'),
            toGroup([1, 1], '1'),
            toGroup([1, 1], '2'),
            toGroup([1, 1], '3'),
            toGroup([1, 1], '4'),
            toGroup([1, 1], '5'),
            toGroup([1, 1], '6'),
            toGroup([1, 1], '7'),
            toGroup([1, 1], '8'),
            toGroup([1, 1], '9'),
            toGroup([1, 1], 'a'),
            toGroup([1, 1], 'b'),
            toGroup([1, 1], 'c'),
            toGroup([1, 1], 'd'),
            toGroup([1, 1], 'e'),
            toGroup([1, 1], 'f')
        ];

        expect(groups).to.deep.equals(
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]
        );
    });

    it('two uuid strings belong to different groups', () => {
        const groups = [
            toGroup([1, 1], '5251410c-004e-41c1-87ce-52ef98ee8ba9'),
            toGroup([1, 1], 'a3273afc-004d-4433-b656-8cb069d7245b'),
        ];

        expect(groups).to.deep.equals(
            [0, 1]
        );
    });

    it('two strings belong to different groups with custom alphabet', () => {
        const model = createModel('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*-');

        const groups = [
            toGroup([1, 1], 'BZheS-2mSdSUgKvXyKCsdQ', model),
            toGroup([1, 1], 'ukp8FgUt-cLVoe8R*BG5uQ', model),
        ];

        expect(groups).to.deep.equals(
            [0, 1]
        );
    });
});