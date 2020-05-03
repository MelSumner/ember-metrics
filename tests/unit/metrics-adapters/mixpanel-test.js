import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';

let sandbox, config;

moduleFor('ember-metrics@metrics-adapter:mixpanel', 'mixpanel adapter', {
  beforeEach() {
    sandbox = sinon.createSandbox();
    config = {
      token: 'meowmeows'
    };
  },
  afterEach() {
    sandbox.restore();
  }
});

test('#identify calls `mixpanel.identify` and `mixpanel.people.set` with the right arguments', function(assert) {
  const adapter = this.subject({ config });
  const identify_stub = sandbox.stub(window.mixpanel, 'identify').callsFake(() => {
    return true;
  });
  const people_set_stub = sandbox.stub(window.mixpanel.people, 'set').callsFake(() => {
    return true;
  });
  adapter.identify({
    distinctId: 123,
    foo: 'bar',
    cookie: 'chocolate chip'
  });
  adapter.identify({
    distinctId: 123
  });
  assert.ok(identify_stub.firstCall.calledWith(123), 'it sends the correct arguments and options');
  assert.ok(identify_stub.secondCall.calledWith(123), 'it sends the correct arguments');
  assert.ok(people_set_stub.firstCall.calledWith({ cookie: 'chocolate chip', foo: 'bar' }), 'it sends the correct arguments and options');
  assert.equal(people_set_stub.secondCall, null, 'people.set does not fire if there are no additional options');
});

test('#trackEvent calls `mixpanel.track` with the right arguments', function(assert) {
  const adapter = this.subject({ config });
  const stub = sandbox.stub(window.mixpanel, 'track').callsFake(() => {
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
  assert.ok(stub.firstCall.calledWith('Video played', { videoLength: 213, id: 'hY7gQr0' }), 'it sends the correct arguments and options');
  assert.ok(stub.secondCall.calledWith('Ate a cookie'), 'it sends the correct arguments');
});

test('#trackPage calls `mixpanel.track` with the right arguments', function(assert) {
  const adapter = this.subject({ config });
  const stub = sandbox.stub(window.mixpanel, 'track').callsFake(() => {
    return true;
  });
  adapter.trackPage({
    page: '/products/1'
  });
  adapter.trackPage({
    event: 'Page View',
    page: '/products/1'
  });
  assert.ok(stub.firstCall.calledWith('page viewed', { page: '/products/1' }), 'it sends the correct arguments and options');
  assert.ok(stub.secondCall.calledWith('Page View', { page: '/products/1' }), 'it sends the correct arguments and options');
});

test('#trackPageEventName - test this property is ', function(assert) {
  const baseConfig = { config };
  const modifiedConfig = Object.assign({}, baseConfig);
  modifiedConfig.config.trackPageEventName ='Yee Haw';
  const adapter = this.subject(modifiedConfig);
  const stub = sandbox.stub(window.mixpanel, 'track').callsFake(() => {
    return true;
  });
  adapter.trackPage({
    page: '/products/1'
  });
  adapter.trackPage({
    event: 'Page View',
    page: '/products/1'
  });
  assert.ok(stub.firstCall.calledWith('Yee Haw', { page: '/products/1' }), 'it sends the correct arguments and options');
  assert.ok(stub.secondCall.calledWith('Page View', { page: '/products/1' }), 'it sends the correct arguments and options');
});

test('#alias calls `mixpanel.alias` with the right arguments', function(assert) {
  const adapter = this.subject({ config });
  const stub = sandbox.stub(window.mixpanel, 'alias').callsFake(() => {
    return true;
  });
  adapter.alias({
    alias: 'user@example.com',
    original: 123
  });
  adapter.alias({
    alias: 'foo@bar.com'
  });
  assert.ok(stub.firstCall.calledWith('user@example.com', 123), 'it sends the correct arguments and options');
  assert.ok(stub.secondCall.calledWith('foo@bar.com'), 'it sends the correct arguments');
});
