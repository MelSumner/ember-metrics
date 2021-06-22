import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

let sandbox, config;

module('intercom adapter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    sandbox = sinon.createSandbox();
    config = {
      appId: 'def1abc2'
    };
  });

  hooks.afterEach(function() {
    sandbox.restore();
  });

  test('#identify with `distinctId` calls `Intercom()` with the right arguments', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:intercom').create({ config });
    const stub = sandbox.stub(window, 'Intercom').callsFake(() => {
      return true;
    });
    adapter.identify({
      distinctId: 123,
      foo: 'bar'
    });
    adapter.identify({
      distinctId: 123
    });
    assert.ok(stub.firstCall.calledWith('boot', { app_id: 'def1abc2', foo: 'bar', user_id: 123 }), 'it sends the correct arguments');
    assert.ok(stub.secondCall.calledWith('update', { app_id: 'def1abc2', user_id: 123 }), 'it sends the correct arguments');
  });

  test('#identify with `email` calls `Intercom()` with the right arguments', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:intercom').create({ config });
    const stub = sandbox.stub(window, 'Intercom').callsFake(() => {
      return true;
    });
    adapter.identify({
      email: 'tomster@ember.js',
      foo: 'bar'
    });
    adapter.identify({
      email: 'tomster@ember.js'
    });
    assert.ok(stub.firstCall.calledWith('boot', { app_id: 'def1abc2', email: 'tomster@ember.js', foo: 'bar' }), 'it sends the correct arguments');
    assert.ok(stub.secondCall.calledWith('update', { app_id: 'def1abc2', email: 'tomster@ember.js' }), 'it sends the correct arguments');
  });

  test('#identify without `distinctId` or `email` throws', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:intercom').create({ config });
    const stub = sandbox.stub(window, 'Intercom').callsFake(() => {
      return true;
    });
    assert.throws(() => {
      adapter.identify({
        foo: 'bar'
      });
    }, /You must pass `distinctId` or `email`/, 'exception is thrown');
    assert.equal(stub.callCount, 0, 'Intercom() is not called');
  });

  test('#identify calls `Intercom()` with `boot` on initial call, then `update` on subsequent calls', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:intercom').create({ config });
    const stub = sandbox.stub(window, 'Intercom').callsFake(() => {
      return true;
    });
    adapter.identify({
      distinctId: 123
    });
    adapter.identify({
      distinctId: 123
    });
    adapter.identify({
      distinctId: 123
    });
    assert.ok(stub.firstCall.calledWith('boot', { app_id: 'def1abc2', user_id: 123 }), 'it sends the correct arguments');
    assert.ok(stub.secondCall.calledWith('update', { app_id: 'def1abc2', user_id: 123 }), 'it sends the correct arguments');
    assert.ok(stub.thirdCall.calledWith('update', { app_id: 'def1abc2', user_id: 123 }), 'it sends the correct arguments');
  });

  test('#trackEvent calls `Intercom()` with the right arguments', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:intercom').create({ config });
    const stub = sandbox.stub(window, 'Intercom').callsFake(() => {
      return true;
    });
    adapter.trackEvent({
      event: 'Video played',
      videoLength: 213,
      id: 'hY7gQr0'
    });
    adapter.trackEvent({
      event: 'Ate a cookie'
    });
    adapter.trackEvent({
      event: null,
      id: 'hY7gQr0'
    })
    assert.ok(stub.firstCall.calledWith('trackEvent', 'Video played', { videoLength: 213, id: 'hY7gQr0' }), 'it sends the correct arguments');
    assert.ok(stub.secondCall.calledWith('trackEvent', 'Ate a cookie'), 'it sends the correct arguments');
    assert.ok(stub.thirdCall.calledWith('trackEvent', 'unspecified-event', { id: 'hY7gQr0'}), 'it sends the correct arguments');
  });

  test('#trackPage calls `Intercom()` with the right arguments', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:intercom').create({ config });
    const stub = sandbox.stub(window, 'Intercom').callsFake(() => {
      return true;
    });
    adapter.trackPage({
      page: '/products/1'
    });
    adapter.trackPage({
      event: 'Page View',
      page: '/products/1'
    });
    assert.ok(stub.firstCall.calledWith('trackEvent', 'page viewed', { page: '/products/1' }), 'it sends the correct arguments and options');
    assert.ok(stub.secondCall.calledWith('trackEvent', 'Page View', { page: '/products/1' }), 'it sends the correct arguments and options');
  });
});

test('#invokeBoot calls `Intercom()` with the right arguments', function(assert) {
  const adapter = this.subject({ config });
  const stub = sandbox.stub(window, 'Intercom').callsFake(() => {
    return true;
  });
  adapter.boot();
  assert.ok(stub.firstCall.calledWith('boot', { app_id: 'def1abc2' }), 'it sends the correct arguments and options');
});
