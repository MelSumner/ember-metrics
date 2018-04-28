import { assign } from '@ember/polyfills';
import { isPresent } from '@ember/utils';
import { copy } from '@ember/object/internals';
import { assert } from '@ember/debug';
import { get } from '@ember/object';
import $ from 'jquery';
import { capitalize } from '@ember/string';
import canUseDOM from '../utils/can-use-dom';
import objectTransforms from '../utils/object-transforms';
import BaseAdapter from './base';

const { compact } = objectTransforms;

export default BaseAdapter.extend({
  toStringExtension() {
    return 'GoogleAnalytics';
  },

  init() {
    const config = copy(get(this, 'config'));
    const { id, sendHitTask, trace, require, set } = config;
    let { debug } = config;

    assert(`[ember-metrics] You must pass a valid \`id\` to the ${this.toString()} adapter`, id);

    delete config.id;
    delete config.require;
    delete config.set;

    if (debug) { delete config.debug; }
    if (sendHitTask) { delete config.sendHitTask; }
    if (trace) { delete config.trace; }

    const hasOptions = isPresent(Object.keys(config));

    if (canUseDOM) {

      /* eslint-disable */
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script',`https://www.google-analytics.com/analytics${debug ? '_debug' : ''}.js`,'ga');
      /* eslint-enable */

      if (trace === true) {
        window.ga_debug = { trace: true };
      }

      if (hasOptions) {
        window.ga('create', id, config);
      } else {
        window.ga('create', id, 'auto');
      }

      if (require) {
        require.forEach((plugin) => {
          window.ga('require', plugin);
        });
      }

      if (sendHitTask === false) {
        window.ga('set', 'sendHitTask', null);
      }

      if (set) {
        Object.keys(set).forEach((key) => {
          window.ga('set', key, set[key]);
        })
      }

    }
  },

  identify(options = {}) {
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;

    if (canUseDOM) {
      window.ga('set', 'userId', distinctId);
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
      window.ga('send', event);
    }

    return event;
  },

  trackPage(options = {}) {
    const compactedOptions = compact(options);
    const sendEvent = { hitType: 'pageview' };

    const event = assign(sendEvent, compactedOptions);
    for (let key in compactedOptions) {
      if (compactedOptions.hasOwnProperty(key)) {
        window.ga('set', key, compactedOptions[key]);
      }
    }
    if (canUseDOM) {
      window.ga('send', sendEvent);
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
