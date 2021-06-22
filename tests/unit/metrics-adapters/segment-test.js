import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

let sandbox, config;

module('segment adapter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    sandbox = sinon.createSandbox();
    config = {
      key: 'SEGMENT_KEY'
    };
  });

  hooks.afterEach(function() {
    sandbox.restore();
  });

  test('#identify calls analytics with the right arguments', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:segment').create({ config });
    const stub = sandbox.stub(window.analytics, 'identify').callsFake(() => {
      return true;
    });
    adapter.identify({
      distinctId: 123
    });
    assert.ok(stub.calledWith(123), 'it sends the correct arguments');
  });

  test('#trackEvent returns the correct response shape', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:segment').create({ config });
    const stub = sandbox.stub(window.analytics, 'track');
    adapter.trackEvent({
      event: 'Signed Up',
      category: 'button',
      action: 'click',
      label: 'nav buttons',
      value: 4
    });
    const expectedArguments = {
      category: 'button',
      action: 'click',
      label: 'nav buttons',
      value: 4
    };

    assert.ok(stub.calledWith('Signed Up', expectedArguments), 'track called with proper arguments');
  });

  test('#trackPage returns the correct response shape', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:segment').create({ config });
    const stub = sandbox.stub(window.analytics, 'page');
    adapter.trackPage({
      page: '/my-overridden-page?id=1',
      title: 'my overridden page'
    });
    const expectedArguments = {
      title: 'my overridden page'
    };

    assert.ok(stub.calledWith('/my-overridden-page?id=1', expectedArguments), 'page called with proper arguments');
  });

  test('#trackPage returns the correct response shape', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:segment').create({ config });
    const stub = sandbox.stub(window.analytics, 'page');
    adapter.trackPage();

    assert.ok(stub.calledWith(), 'page called with default arguments');
  });

  test('#alias returns the correct response shape', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:segment').create({ config });
    const stub = sandbox.stub(window.analytics, 'alias');
    adapter.alias({ alias: 'foo', original: 'bar' });

    assert.ok(stub.calledWith('foo', 'bar'), 'page called with default arguments');
  });
});

test('#group returns the correct response shape', function(assert) {
  const adapter = this.subject({ config });
  const stub = sandbox.stub(window.analytics, 'group');
  adapter.group({ groupId: 123 });

  assert.ok(stub.calledWith(), 'group called with the correct arguments');
});
