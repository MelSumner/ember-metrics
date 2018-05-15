import $ from 'jquery';
import { assert } from '@ember/debug';
import { copy } from '@ember/object/internals';
import { get } from '@ember/object';
import canUseDOM from '../utils/can-use-dom';
import canUseMetrics from '../utils/can-use-metrics';
import { compact } from '../utils/object-transforms';
import BaseAdapter from './base';

export default BaseAdapter.extend({
  toStringExtension() {
    return 'Segment';
  },

  init() {
    const config = copy(get(this, 'config'));
    const segmentKey = config.key;

    assert(`[ember-metrics] You must pass a valid \`key\` to the ${this.toString()} adapter`, segmentKey);

    if (canUseDOM && canUseMetrics) {
      /* eslint-disable */
      window.analytics=window.analytics||[],window.analytics.methods=["identify","group","track","page","pageview","alias","ready","on","once","off","trackLink","trackForm","trackClick","trackSubmit"],window.analytics.factory=function(t){return function(){var a=Array.prototype.slice.call(arguments);return a.unshift(t),window.analytics.push(a),window.analytics}};for(var i=0;i<window.analytics.methods.length;i++){var key=window.analytics.methods[i];window.analytics[key]=window.analytics.factory(key)}window.analytics.load=function(t){if(!document.getElementById("analytics-js")){var a=document.createElement("script");a.type="text/javascript",a.id="analytics-js",a.async=!0,a.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n)}},window.analytics.SNIPPET_VERSION="2.0.9";
      /* eslint-enable */
      window.analytics.load(segmentKey);
    }
  },

  alias(options = {}) {
    const compactedOptions = compact(options);
    const { alias, original } = compactedOptions;

    if (original && canUseDOM && canUseMetrics) {
      window.analytics.alias(alias, original);
    } else if (canUseDOM && canUseMetrics){
      window.analytics.alias(alias);
    }
  },

  identify(options = {}) {
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;
    delete compactedOptions.distinctId;
    if(canUseDOM && canUseMetrics) {
      window.analytics.identify(distinctId, compactedOptions);
    }
  },

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const { event } = compactedOptions;
    delete compactedOptions.event;

    if(canUseDOM && canUseMetrics) {
      window.analytics.track(event, compactedOptions);
    }
  },

  trackPage(options = {}) {
    const compactedOptions = compact(options);
    const { page } = compactedOptions;
    delete compactedOptions.page;

    if(canUseDOM && canUseMetrics) {
      window.analytics.page(page, compactedOptions);
    }
  },

  willDestroy() {
    if(canUseDOM && canUseMetrics) {
      $('script[src*="segment.com"]').remove();
      delete window.analytics;
    }
  }
});
