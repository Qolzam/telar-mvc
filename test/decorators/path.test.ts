import { IController } from '../../src/interfaces';
import { Sandbox } from '../resources/classes/sandbox';
import { Controller } from '../../src/classes/controller';
import { path } from '../../src/decorators/path';

describe('@path()', function () {
  it('should set the controller path', () => {
    @path('/test')
    class TestController extends Controller {}

    const id = Symbol();

    const sandbox = new Sandbox({
      controllersMap: new Map([
        [id, TestController]
      ])
    });

    expect(sandbox.getContainer().get<IController>(id).getPath()).to.equal('/test');
  });
});