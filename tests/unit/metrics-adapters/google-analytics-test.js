import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';

let sandbox, config;

moduleFor('ember-metrics@metrics-adapter:google-analytics', 'google-analytics adapter', {
  beforeEach() {
    sandbox = sinon.sandbox.create();
    config = {
      id: 'UA-XXXX-Y'
    };
  },
  afterEach() {
    sandbox.restore();
  }
});

test('#identify calls ga with the right arguments', function(assert) {
  const adapter = this.subject({ config });
  const stub = sandbox.stub(window, 'ga', () => {
    return true;
  });
  adapter.identify({
    distinctId: 123
  });
  assert.ok(stub.calledWith('GoogleAnalytics.set', 'userId', 123), 'it sends the correct arguments');
});

test('#identify calls ga with the right arguments if custom name is provided', function(assert) {
  config = Object.assign(config, { name: 'MyCustomAnalytics' });
  const adapter = this.subject({ config });
  const stub = sandbox.stub(window, 'ga', () => {
    return true;
  });
  adapter.identify({
    distinctId: 123
  });
  assert.ok(stub.calledWith('MyCustomAnalytics.set', 'userId', 123), 'it sends the correct arguments');
});

test('#trackEvent returns the correct response shape', function(assert) {
  const adapter = this.subject({ config });
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
  const adapter = this.subject({ config });
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

test('#trackPage returns the correct response shape', function(assert) {
  const adapter = this.subject({ config });
  sandbox.stub(window, 'ga');
  const result = adapter.trackPage();
  const expectedResult = {
    hitType: 'pageview'
  };

  assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
});
