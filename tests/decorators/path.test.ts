import { expect } from 'chai';

import { IController } from '../../src/interfaces/controller';
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { Path } from '../../src/decorators/Path';

describe('@Path()', function () {
    it('should set the controller path', () => {
        @Path('/test')
        class TestController extends Controller {}

        const id = Symbol();

        const sandbox = new Sandbox({
            controllersMap: new Map([[id, TestController]]),
        });

        expect(sandbox.getContainer().get<IController>(id).getPath()).to.equal('/test');
    });
});
