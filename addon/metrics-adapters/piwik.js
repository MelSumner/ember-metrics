import { assert } from '@ember/debug';
import $ from 'jquery';
import { get } from '@ember/object';
import canUseDOM from '../utils/can-use-dom';
import canUseMetrics from '../utils/can-use-metrics';
import BaseAdapter from './base';

export default BaseAdapter.extend({
  toStringExtension() {
    return 'Piwik';
  },

  init() {
    const config = get(this, 'config');
    const { piwikUrl, siteId } = config;

    assert(`[ember-metrics] You must pass a \`piwikUrl\` and a \`siteId\` to the ${this.toString()} adapter`, piwikUrl && siteId);

    if(canUseDOM && canUseMetrics) {
      window._paq = window._paq || [];
      (function() {
        window._paq.push(['setTrackerUrl', `${piwikUrl}/piwik.php`]);
        window._paq.push(['setSiteId', siteId]);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.defer=true; g.src=`${piwikUrl}/piwik.js`; s.parentNode.insertBefore(g,s);
      })();
    }
  },

  identify(options = {}) {
    if(canUseDOM && canUseMetrics) {
      window._paq.push(['setUserId', options.userId]);
    }
  },

  trackEvent(options = {}) {
    if(canUseDOM && canUseMetrics) {
      window._paq.push(['trackEvent', options.category, options.action, options.name, options.value]);
    }
  },

  trackPage(options = {}) {
    if(canUseDOM && canUseMetrics) {
      window._paq.push(['setCustomUrl', options.page]);
      window._paq.push(['trackPageView', options.title]);
    }
  },

  willDestroy() {
    if(canUseDOM && canUseMetrics) {
      $('script[src*="piwik"]').remove();
      delete window._paq;
    }
  }
});
