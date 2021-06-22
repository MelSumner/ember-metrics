import { assign } from '@ember/polyfills';
import { assert } from '@ember/debug';
import { compact, without } from '../utils/object-transforms';
import removeFromDOM from '../utils/remove-from-dom';
import BaseAdapter from './base';

export default class Intercom extends BaseAdapter {
  booted = false;

  toStringExtension() {
    return 'Intercom';
  }

  init() {
    const { appId } = this.config;

    assert(`[ember-metrics] You must pass a valid \`appId\` to the ${this.toString()} adapter`, appId);

    /* eslint-disable */
    (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',{});}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;(function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;
    s.src=`https://widget.intercom.io/widget/${appId}`;
    var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);})(); }})()
    /* eslint-enable */
  }

  identify(options = {}) {
    const { appId } = this.config;
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;
    const props = without(compactedOptions, 'distinctId');
    props.app_id = appId;
    if (distinctId) {
      props.user_id = distinctId;
    }


    assert(`[ember-metrics] You must pass \`distinctId\` or \`email\` to \`identify()\` when using the ${this.toString()} adapter`, props.email || props.user_id);

    const method = this.booted ? 'update' : 'boot';
    window.Intercom(method, props);
    this.booted = true;
  }

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const { event = 'unspecified-event' } = compactedOptions;
    const props = without(compactedOptions, 'event');

    window.Intercom('trackEvent', event, props);
  }

  trackPage(options = {}) {
    const event = { event: 'page viewed' };
    const mergedOptions = assign(event, options);

    this.trackEvent(mergedOptions);
  }

  boot(options = {}) {
    if (this.booted) { return; }

    const { appId } = get(this, 'config');
    const props = compact(options);

    props.app_id = appId;

    if (canUseDOM) {
      window.Intercom('boot', props);
      this.booted = true;
    }
  },

  willDestroy() {
    removeFromDOM('script[src*="intercom"]');

    delete window.Intercom;
  }
}
