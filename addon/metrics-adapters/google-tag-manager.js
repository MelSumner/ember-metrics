import { assign } from '@ember/polyfills';
import { assert } from '@ember/debug';
import $ from 'jquery';
import { getWithDefault, set, get } from '@ember/object';
import { capitalize } from '@ember/string';
import canUseDOM from '../utils/can-use-dom';
import canUseMetrics from '../utils/can-use-metrics';
import objectTransforms from '../utils/object-transforms';
import BaseAdapter from './base';

const {
  compact
} = objectTransforms;

export default BaseAdapter.extend({
  dataLayer: 'dataLayer',

  toStringExtension() {
    return 'GoogleTagManager';
  },

  init() {
    const config = get(this, 'config');
    const { id, envParams } = config;
    const dataLayer = getWithDefault(config, 'dataLayer', 'dataLayer');
    const envParamsString = envParams ? `&${envParams}`: '';

    assert(`[ember-metrics] You must pass a valid \`id\` to the ${this.toString()} adapter`, id);

    set(this, 'dataLayer', dataLayer);

    if (canUseDOM && canUseMetrics) {
      (function(w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js'
        });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l !== 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl + envParamsString;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', get(this, 'dataLayer'), id);
    }
  },

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const dataLayer = get(this, 'dataLayer');
    const gtmEvent = {'event': compactedOptions['event']};

    delete compactedOptions['event'];

    for (let key in compactedOptions) {
      const capitalizedKey = capitalize(key);
      gtmEvent[`event${capitalizedKey}`] = compactedOptions[key];
    }

    if (canUseDOM && canUseMetrics) {
      window[dataLayer].push(gtmEvent);
    }

    return gtmEvent;
  },

  trackPage(options = {}) {
    const compactedOptions = compact(options);
    const dataLayer = get(this, 'dataLayer');
    const sendEvent = {
      event: compactedOptions['event'] || 'pageview'
    };

    const pageEvent = assign(sendEvent, compactedOptions);

    if (canUseDOM && canUseMetrics) {
      window[dataLayer].push(pageEvent);
    }

    return pageEvent;
  },

  willDestroy() {
    if (canUseDOM && canUseMetrics) {
      $('script[src*="gtm.js"]').remove();
      delete window.dataLayer;
    }
  }
});
