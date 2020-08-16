import { later } from '@ember/runloop';
import { Promise as EmberPromise } from 'rsvp';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

let config, fbq, subject;

module('facebook-pixel adapter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    config = {
      id: '1234567890',
      dataProcessingOptions: {
        method: ['LDU'],
        country: 1,
        state: 1000,
      }
    };

    subject = this.owner.factoryFor('ember-metrics@metrics-adapter:facebook-pixel').create({ config });

    return waitForScripts();
  });

  hooks.afterEach(function() {
    fbq.restore();
  });

  function waitForScripts() {
    return new EmberPromise(resolve => {
      function init() {
        fbq = sinon.spy(window, 'fbq');
        resolve();
      }

      (function wait() {
        // check for the generic script
        if (window.fbq.instance) {
          // now check for the custom script
          // it may have already loaded and
          // registering a listener will never fire
          if (window.fbq.instance.configsLoaded[config.id]) {
            init();
          } else {
            later(wait, 10);
          }
        } else {
          // generic script hasn't run yet
          later(wait, 10);
        }
      })();
    });
  }

  test('#trackEvent calls `fbq.track` with the right arguments', function(assert) {
    subject.trackEvent({ event: 'Search', opt1: 'bar', opt2: 'baz' });
    assert.ok(fbq.calledWith('track', 'Search', { opt1: 'bar', opt2: 'baz' }), 'it sends the correct arguments and options');
  });

  test('#trackPage calls `fbq.track` with the right arguments', function(assert) {
    subject.trackPage({ page: '/my-page', title: 'My Title' });
    assert.ok(fbq.calledWith('track', 'PageView', { page: '/my-page', title: 'My Title' }), 'it sends the correct arguments and options');
  });

  test("#init calls `fbq` with dataProcessingOptions", function(assert) {
    let { dataProcessingOptions, dataProcessingCountry, dataProcessingState } = fbq.instance.pluginConfig._configStore.dataProcessingOptions.global;

    assert.ok((dataProcessingOptions == 'LDU'), 'it sends the correct Data Processing Options');
    assert.ok((dataProcessingCountry == 1), 'it sends the correct Data Processing Country');
    assert.ok((dataProcessingState == 1000), 'it sends the correct Data Processing State');
  });
});

test('#trackCustom calls `fbq.track` with the right arguments', function(assert) {
  subject.trackCustom({ event: 'AdClick', opt1: 'bar', opt2: 'baz' });
  assert.ok(fbq.calledWith('trackCustom', 'AdClick', { opt1: 'bar', opt2: 'baz' }), 'it sends the correct arguments and options');
});
