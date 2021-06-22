import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

let sandbox, config;

module('google-analytics adapter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    sandbox = sinon.createSandbox();
    config = {
      id: 'UA-XXXX-Y',
      require: ['ecommerce']
    };
  });

  hooks.afterEach(function() {
    sandbox.restore();
  });

  test('#init calls ga create with a valid config', function(assert) {
    config.sendHitTask = false;
    config.debug = false;
    config.trace = false;
    config.sampleRate = 5;

    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:google-analytics').create({ config });
    const stub = sandbox.stub(window, 'ga').callsFake(() => {
      return true;
    });
    adapter.init();

    assert.ok(stub.calledWith('create', config.id, {
      sampleRate: 5
    }), 'it sends the correct config values');
  });

  test('#init calls ga create with a valid config including trackerName', function(assert) {
    config.sendHitTask = false;
    config.debug = false;
    config.trace = false;
    config.sampleRate = 5;
    config.trackerName = 'myEngineTracker';

    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:google-analytics').create({ config });
    const stub = sandbox.stub(window, 'ga').callsFake(() => {
      return true;
    });
    adapter.init();

    assert.ok(stub.calledWith('create', config.id, {
      sampleRate: 5
    }, 'myEngineTracker'), 'it sends the correct config values');
    assert.equal(adapter.gaSendKey, 'myEngineTracker.send', 'ga has myEngineTracker trackerName set');
  });

  test('#init calls ga for any plugins specified', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:google-analytics').create({ config });
    const stub = sandbox.stub(window, 'ga').callsFake(() => {
      return true;
    });
    adapter.init();
    assert.ok(stub.calledWith('require', 'ecommerce'), 'it sends the correct arguments');
  });

  test('#identify calls ga with the right arguments', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:google-analytics').create({ config });
    const stub = sandbox.stub(window, 'ga').callsFake(() => {
      return true;
    });
    adapter.identify({
      distinctId: 123
    });
    assert.ok(stub.calledWith('set', 'userId', 123), 'it sends the correct arguments');
  });

  test('#trackEvent returns the correct response shape', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:google-analytics').create({ config });
    sandbox.stub(window, 'ga');
    const result = adapter.trackEvent({
      category: 'button',
      action: 'click',
      label: 'nav buttons',
      value: 4,
      dimension1: true
    });
    const expectedResult = {
      hitType: 'event',
      eventCategory: 'button',
      eventAction: 'click',
      eventLabel: 'nav buttons',
      eventValue: 4,
      dimension1: true
    };

    assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
  });

  test('#trackPage returns the correct response shape', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:google-analytics').create({ config });
    sandbox.stub(window, 'ga');
    const result = adapter.trackPage({
      page: '/my-overridden-page?id=1',
      title: 'my overridden page'
    });
    const expectedResult = {
      hitType: 'pageview',
      page: '/my-overridden-page?id=1',
      title: 'my overridden page'
    };

    assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
  });

  test('#trackEvent with trackerName returns the correct response shape', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:google-analytics').create({ config });
    sandbox.stub(window, 'ga');
    const result = adapter.trackEvent({
      category: 'button',
      action: 'click',
      label: 'nav buttons',
      value: 4,
      dimension1: true
    });
    const expectedResult = {
      hitType: 'event',
      eventCategory: 'button',
      eventAction: 'click',
      eventLabel: 'nav buttons',
      eventValue: 4,
      dimension1: true
    };

    assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
  });

  test('#trackPage returns the correct response shape', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:google-analytics').create({ config });
    sandbox.stub(window, 'ga');
    const result = adapter.trackPage();
    const expectedResult = {
      hitType: 'pageview'
    };

    assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
  });
});

test('#set calls ga with the right arguments', function(assert) {
  const adapter = this.subject({ config });
  const stub = sandbox.stub(window, 'ga', () => {
    return true;
  });
  adapter.setPage({
    page: 'www.google.com'
  });
  assert.ok(stub.calledWith('set', 'page', 'www.google.com'), 'it sends the correct arguments');
});

test('#trackTiming returns the correct response shape', function(assert) {
  const adapter = this.subject({ config });
  sandbox.stub(window, 'ga');
  const result = adapter.trackTiming(
    {
      hitType: 'timing',
      timingCategory: 'timingPage',
      timingVar: 'timingVar',
      timingValue: 200
    }
  );
  const expectedResult = {
    hitType: 'timing',
    timingCategory: 'timingPage',
    timingVar: 'timingVar',
    timingValue: 200
  };

  assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
});
