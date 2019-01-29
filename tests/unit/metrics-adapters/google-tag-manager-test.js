import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';

let sandbox, config;

moduleFor('ember-metrics@metrics-adapter:google-tag-manager', 'google-tag-manager adapter', {
  beforeEach() {
    sandbox = sinon.sandbox.create();
    config = {
      id: 'GTM-XXXX'
    };
  },
  afterEach() {
    sandbox.restore();
  }
});

test('#trackEvent returns the correct response shape', function(assert) {
  const adapter = this.subject({ config });
  sandbox.stub(window, 'dataLayer').value({push(){}});

  const result = adapter.trackEvent({
    event: 'click-button',
    category: 'button',
    action: 'click',
    label: 'nav buttons',
    value: 4
  });
  const expectedResult = {
    'event': 'click-button',
    'eventCategory': 'button',
    'eventAction': 'click',
    'eventLabel': 'nav buttons',
    'eventValue': 4
  };
  assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
});

test('#trackPage returns the correct response shape', function(assert) {
  const adapter = this.subject({ config });
  sandbox.stub(window, 'dataLayer').value({ push(){} });

  const result = adapter.trackPage({
    url: '/my-overridden-page?id=1',
    title: 'my overridden page'
  });
  const expectedResult = {
    'event': 'pageview',
    'url': '/my-overridden-page?id=1',
    'title': 'my overridden page'
  };

  assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
});

test('#trackPage accepts a custom dataLayerProp name', function(assert) {
  const customConfig = config;
  customConfig['dataLayerProp'] = 'customDataLayerProp';

  const adapter = this.subject({
    config: customConfig
  });

  sandbox.stub(window, 'customDataLayerProp').value({ push(){} });

  const result = adapter.trackPage({
    url: '/my-overridden-page?id=1',
    title: 'my overridden page'
  });

  const expectedResult = {
    'event': 'pageview',
    'url': '/my-overridden-page?id=1',
    'title': 'my overridden page'
  };

  assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
});

test('#trackPage accepts a custom dataLayer', function(assert) {
  const adapter = this.subject({ config });
  const dataLayer = [{foo: 'bar'}];
  sandbox.stub(window, 'dataLayer').value(dataLayer);

  const result = adapter.trackPage({
    url: '/my-overridden-page?id=1',
    title: 'my overridden page'
  });

  const expectedResult = {
    'event': 'pageview',
    'url': '/my-overridden-page?id=1',
    'title': 'my overridden page'
  };

  assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
  assert.deepEqual(dataLayer, window.dataLayer, 'it sets the default dataLayer');
});

test('#trackPage accepts custom `keyNames` and returns the correct response shape', function(assert) {
  const adapter = this.subject({ config });
  sandbox.stub(window, 'dataLayer').value({ push(){} });

  const result = adapter.trackPage({
    event: 'VirtualPageView',
    VirtualPageUrl: '/my-overridden-page?id=1',
    VirtualTitle: 'my overridden page'
  });

  const expectedResult = {
    'event': 'VirtualPageView',
    'VirtualPageUrl': '/my-overridden-page?id=1',
    'VirtualTitle': 'my overridden page'
  };

  assert.deepEqual(result, expectedResult, 'it sends the correct response shape');
});
