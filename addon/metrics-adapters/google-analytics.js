import { assign } from '@ember/polyfills';
import { isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import { set } from '@ember/object';
import { capitalize } from '@ember/string';
import { compact } from '../utils/object-transforms';
import removeFromDOM from '../utils/remove-from-dom';
import BaseAdapter from './base';

export default class GoogleAnalytics extends BaseAdapter {
  toStringExtension() {
    return 'GoogleAnalytics';
  }

  init() {
    const config = assign({}, this.config);
    const { id, sendHitTask, trace, require, debug, trackerName } = config;
    set(this, 'gaSendKey', trackerName ? trackerName + '.send' : 'send');

    assert(`[ember-metrics] You must pass a valid \`id\` to the ${this.toString()} adapter`, id);

    delete config.id;
    delete config.require;
    delete config.debug;
    delete config.sendHitTask;
    delete config.trace;
    delete config.trackerName;

    const hasOptions = isPresent(Object.keys(config));

    /* eslint-disable */
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script',`https://www.google-analytics.com/analytics${debug ? '_debug' : ''}.js`,'ga');
    /* eslint-enable */

    if (trace === true) {
      window.ga_debug = { trace: true };
    }

    window.ga('create', id, hasOptions ? config : 'auto', trackerName);

    if (require) {
      require.forEach((plugin) => {
        window.ga('require', plugin);
      });
    }

    if (sendHitTask === false) {
      window.ga('set', 'sendHitTask', null);
    }
  }

  identify(options = {}) {
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;

    window.ga('set', 'userId', distinctId);
  }

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
    const gaSendKey = this.gaSendKey;
    window.ga(gaSendKey, event);

    return event;
  }

  trackPage(options = {}) {
    const compactedOptions = compact(options);
    const sendEvent = { hitType: 'pageview' };
    const event = assign(sendEvent, compactedOptions);

    for (let key in compactedOptions) {
      // eslint-disable-next-line
      if (compactedOptions.hasOwnProperty(key)) {
        window.ga('set', key, compactedOptions[key]);
      }
    }
    const gaSendKey = this.gaSendKey;
    window.ga(gaSendKey, event);

    return event;
  }

  setPage(options = {}) {
    let { page } = options ;
    if (canUseDOM) {
      window.ga('set', 'page', page);
    }
    return;
  },
  trackTiming(options = {}) {
   const compactedOptions = compact(options);
   const sendEvent = { hitType: 'timing' };
   const eventKeys = ['category', 'var', 'label', 'value'];
   let gaEvent = {};

   if (compactedOptions.nonInteraction) {
     gaEvent.nonInteraction = compactedOptions.nonInteraction;
     delete compactedOptions.nonInteraction;
   }

   for (let key in compactedOptions) {
     if (eventKeys.includes(key)) {
       const capitalizedKey = capitalize(key);
       gaEvent[`timing${capitalizedKey}`] = compactedOptions[key];
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

  willDestroy() {
    removeFromDOM('script[src*="google-analytics"]');

    delete window.ga;
  }
}
