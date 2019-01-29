import { assign } from '@ember/polyfills';
import { assert } from '@ember/debug';
import $ from 'jquery';
import { getWithDefault, set, get } from '@ember/object';
import { capitalize } from '@ember/string';
import canUseDOM from '../utils/can-use-dom';
import objectTransforms from '../utils/object-transforms';
import BaseAdapter from './base';

const {
  assert,
  get,
  set,
  $,
  getWithDefault,
  isBlank,
  String: { capitalize }
} = Ember;
const assign = Ember.assign || Ember.merge;
const {
  compact
} = objectTransforms;

export default BaseAdapter.extend({
  dataLayerProp: 'dataLayer',
  dataLayer: null,

  toStringExtension() {
    return 'GoogleTagManager';
  },

  init() {
    const config = get(this, 'config');
    const { id, envParams, dataLayer } = config;
    if (!isBlank(dataLayer)) {
      set(this, 'dataLayer', dataLayer);
    }

    const dataLayerProp = get(this, 'dataLayerProp');
    const dataLayerValue = getWithDefault(config, dataLayerProp, []);
    const envParamsString = envParams ? `&${envParams}`: '';

    assert(`[ember-metrics] You must pass a valid \`id\` to the ${this.toString()} adapter`, id);

    window[dataLayerProp] = dataLayerValue;

    if (canUseDOM) {
      (function(w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js'
        });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l !== dataLayerProp ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl + envParamsString;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', dataLayerProp, id);
    }
  },

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const gtmEvent = {'event': compactedOptions['event']};
    const dataLayerProp = get(this, 'dataLayerProp');

    delete compactedOptions['event'];

    for (let key in compactedOptions) {
      const capitalizedKey = capitalize(key);
      gtmEvent[`event${capitalizedKey}`] = compactedOptions[key];
    }

    if (canUseDOM) {
      window[dataLayerProp].push(gtmEvent);
    }

    return gtmEvent;
  },

  trackPage(options = {}) {
    const compactedOptions = compact(options);
    const dataLayerProp = get(this, 'dataLayerProp');
    const sendEvent = {
      event: compactedOptions['event'] || 'pageview'
    };

    const pageEvent = assign(sendEvent, compactedOptions);

    if (canUseDOM) {
      window[dataLayerProp].push(pageEvent);
    }

    return pageEvent;
  },

  willDestroy() {
    if (canUseDOM) {
      $('script[src*="gtm.js"]').remove();
      delete window[get(this, 'dataLayerProp')];
    }
  }
});
