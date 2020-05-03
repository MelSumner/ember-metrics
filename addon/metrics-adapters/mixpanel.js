import { assign } from '@ember/polyfills';
import { assert } from '@ember/debug';
import { get } from '@ember/object';
import objectTransforms from '../utils/object-transforms';
import removeFromDOM from '../utils/remove-from-dom';
import BaseAdapter from './base';

const {
  without,
  compact,
  isPresent
} = objectTransforms;

export default BaseAdapter.extend({
  toStringExtension() {
    return 'Mixpanel';
  },

  init() {
    const config = get(this, 'config');
    const { token } = config;

    assert(`[ember-metrics] You must pass a valid \`token\` to the ${this.toString()} adapter`, token);

    /* eslint-disable */
    (function(e,a){if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)))}catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,
    0)))}}var d=a;"undefined"!==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
    for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);
    mixpanel.init(token,{"api_host":"https://api.mixpanel.com","secure_cookie":true});
    /* eslint-enable */
  },

  identify(options = {}) {
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;
    const props = without(compactedOptions, 'distinctId');

    if (isPresent(props)) {
      window.mixpanel.identify(distinctId);
      window.mixpanel.people.set(props);
    } else {
      window.mixpanel.identify(distinctId);
    }
  },

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const { event } = compactedOptions;
    const props = without(compactedOptions, 'event');

    if (isPresent(props)) {
      window.mixpanel.track(event, props);
    } else {
      window.mixpanel.track(event);
    }
  },

  trackPage(options = {}) {
    const config = get(this, 'config');
    let { trackPageEventName } = config;
    trackPageEventName = trackPageEventName || 'page viewed';
    const event = { event: trackPageEventName };
    const mergedOptions = assign(event, options);

    this.trackEvent(mergedOptions);
  },

  alias(options = {}) {
    const compactedOptions = compact(options);
    const { alias, original } = compactedOptions;

    if (original) {
      window.mixpanel.alias(alias, original);
    } else {
      window.mixpanel.alias(alias);
    }
  },

  willDestroy() {
    removeFromDOM('script[src*="mixpanel"]');

    delete window.mixpanel;
  }
});
