import Ember from 'ember';
import canUseDOM from '../utils/can-use-dom';
import objectTransforms from '../utils/object-transforms';
import BaseAdapter from './base';

const {
  isPresent,
  copy,
  assert,
  get,
  $,
  String: { capitalize }
} = Ember;
const { compact } = objectTransforms;
const assign = Ember.assign || Ember.merge;

export default BaseAdapter.extend({
  toStringExtension() {
    return 'GoogleAnalytics';
  },

  name() {
    const config = copy(get(this, 'config'));
    return typeof config.name === 'undefined' ? this.toStringExtension() : config.name;
  },

  init() {
    const config = copy(get(this, 'config'));
    const { id, sendHitTask, trace, debug } = config;

    assert(`[ember-metrics] You must pass a valid \`id\` to the ${this.toString()} adapter`, id);

    delete config.id;

    if (debug) {
      delete config.debug;
    }
    if (sendHitTask) {
      delete config.sendHitTask;
    }
    if (trace) {
      delete config.trace;
    }

    const hasOptions = isPresent(Object.keys(config));

    if (canUseDOM) {
      /* jshint ignore:start */
      (function(i, s, o, g, r, a, m) {
        i.GoogleAnalyticsObject = r; i[r] = i[r] || function() {
          (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
      })(window, document, 'script', `https://www.google-analytics.com/analytics${debug ? '_debug' : ''}.js`, 'ga');
      /* jshint ignore:end */

      if (trace === true) {
        window.ga_debug = { trace: true };
      }

      if (hasOptions) {
        window.ga('create', id, config);
      } else {
        window.ga('create', id, 'auto');
      }

      if (sendHitTask === false) {
        window.ga(`${this.name()}.set`, 'sendHitTask', null);
      }
    }
  },

  identify(options = {}) {
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;

    if (canUseDOM) {
      window.ga(`${this.name()}.set`, 'userId', distinctId);
    }
  },

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const sendEvent = { hitType: 'event' };
    const eventKeys = ['category', 'action', 'label', 'value'];
    let gaEvent = {};

    if (compactedOptions.nonInteraction) {
      gaEvent.nonInteraction = compactedOptions.nonInteraction;
      delete compactedOptions.nonInteraction;
    }

    for (let key in compactedOptions) {
      if (eventKeys.includes(key)) {
        const capitalizedKey = capitalize(key);
        gaEvent[`event${capitalizedKey}`] = compactedOptions[key];
      } else {
        gaEvent[key] = compactedOptions[key];
      }
    }

    const event = assign(sendEvent, gaEvent);
    if (canUseDOM) {
      window.ga(`${this.name()}.send`, event);
    }

    return event;
  },

  trackPage(options = {}) {
    const compactedOptions = compact(options);
    const sendEvent = { hitType: 'pageview' };

    const event = assign(sendEvent, compactedOptions);
    if (canUseDOM) {
      window.ga(`${this.name()}.send`, event);
    }

    return event;
  },

  willDestroy() {
    if (canUseDOM) {
      $('script[src*="google-analytics"]').remove();
      delete window.ga;
    }
  }
});
