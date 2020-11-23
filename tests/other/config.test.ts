import { expect } from 'chai';

import { Config } from '../../src/config';

describe('Config', () => {
    describe('#set()', () => {
        it('should override value', () => {
            const override = () => new Error();
            const current = Config.get('jsonBodyValidationErrorFactory');
            Config.set('jsonBodyValidationErrorFactory', override);
            expect(Config.get('jsonBodyValidationErrorFactory')).to.equal(override);
            Config.set('jsonBodyValidationErrorFactory', current);
        });
    });
    describe('#get()', () => {
        it('should use default', () => {
            const override = () => new Error();
            expect(Config.get('jsonBodyValidationErrorFactory', override)).to.equal(override);
        });
        it('should NOT use null default', () => {
            expect(Config.get('jsonBodyValidationErrorFactory', null)).to.equal(
                Config.get('jsonBodyValidationErrorFactory'),
            );
        });
        it('should use null default', () => {
            expect(Config.get('jsonBodyValidationErrorFactory', null, true)).to.equal(null);
        });
    });
});
