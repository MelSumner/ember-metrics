import Service from '@ember/service';
import { assign } from '@ember/polyfills';
import { assert } from '@ember/debug';
import { set } from '@ember/object';
import { A as emberArray, makeArray } from '@ember/array';
import { dasherize } from '@ember/string';
import { getOwner } from '@ember/application';

const { keys } = Object;

export default class Metrics extends Service {
  /**
   * Cached adapters to reduce multiple expensive lookups.
   *
   * @property _adapters
   * @private
   * @type Object
   * @default null
   */
  _adapters = {};

  /**
   * Contextual information attached to each call to an adapter. Often you'll
   * want to include things like `currentUser.name` with every event or page
   * view  that's tracked. Any properties that you bind to `metrics.context`
   * will be merged into the options for every service call.
   *
   * @property context
   * @type Object
   * @default null
   */
  context = {};

  /**
   * Indicates whether calls to the service will be forwarded to the adapters
   *
   * @property enabled
   * @type Boolean
   * @default true
   */
  enabled = true;

  /**
   * Information about the active adapters from environment.js
   *
   * I think this could have been isolated to the init method only, but since
   * was public before, would have been a breaking change
   */
  options;

  /**
   * When the Service is created, activate adapters that were specified in the
   * configuration. This config is injected into the Service as
   * `options`.
   *
   * @method init
   * @param {Void}
   * @return {Void}
   */
  init() {
    const owner = getOwner(this);
    const config = owner.factoryFor('config:environment').class;
    const {metricsAdapters = []} = config;
    const {environment = 'development'} = config;
    this.options = {metricsAdapters, environment}

    const adapters = this.options.metricsAdapters || emberArray();
    owner.registerOptionsForType('ember-metrics@metrics-adapter', { instantiate: false });
    owner.registerOptionsForType('metrics-adapter', { instantiate: false });

    set(this, 'appEnvironment', this.options.environment || 'development');

    this.activateAdapters(adapters);

    super.init(...arguments);
  }

  identify(...args) {
    this.invoke('identify', ...args);
  }

  alias(...args) {
    this.invoke('alias', ...args);
  }

  trackEvent(...args) {
    this.invoke('trackEvent', ...args);
  }

  trackPage(...args) {
    this.invoke('trackPage', ...args);
  }

  /**
   * Instantiates the adapters specified in the configuration and caches them
   * for future retrieval.
   *
   * @method activateAdapters
   * @param {Array} adapterOptions
   * @return {Object} instantiated adapters
   */
  activateAdapters(adapterOptions = []) {
    const appEnvironment = this.appEnvironment;
    const cachedAdapters = this._adapters;
    const activatedAdapters = {};

    adapterOptions
      .filter((adapterOption) => this._filterEnvironments(adapterOption, appEnvironment))
      .forEach((adapterOption) => {
        const { name, config } = adapterOption;
        const adapterClass = this._lookupAdapter(name);

        if (typeof FastBoot === 'undefined' || adapterClass.supportsFastBoot) {
          const adapter = cachedAdapters[name] || this._activateAdapter({ adapterClass, config });
          set(activatedAdapters, name, adapter);
        }
      });

    return set(this, '_adapters', activatedAdapters);
  }

  /**
   * Invokes a method on the passed adapter, or across all activated adapters if not passed.
   *
   * @method invoke
   * @param {String} methodName
   * @param {Rest} args
   * @return {Void}
   */
  invoke(methodName, ...args) {
    if (!this.enabled) { return; }

    const cachedAdapters = this._adapters;
    const allAdapterNames = keys(cachedAdapters);
    const [selectedAdapterNames, options] = args.length > 1 ? [makeArray(args[0]), args[1]] : [allAdapterNames, args[0]];
    const context = assign({}, this.context);
    const mergedOptions = assign(context, options);

    selectedAdapterNames
      .map((adapterName) => cachedAdapters[adapterName])
      .forEach((adapter) => adapter && adapter[methodName](mergedOptions));
  }

  /**
   * On teardown, destroy cached adapters together with the Service.
   *
   * @method willDestroy
   * @param {Void}
   * @return {Void}
   */
  willDestroy() {
    const cachedAdapters = this._adapters;

    for (let adapterName in cachedAdapters) {
      cachedAdapters[adapterName].destroy();
    }
  }

  /**
   * Instantiates an adapter.
   *
   * @method _activateAdapter
   * @param {Object}
   * @private
   * @return {Adapter}
   */
  _activateAdapter({ adapterClass, config }) {
    return adapterClass.create(getOwner(this).ownerInjection(), { this: this, config });
  }

  /**
   * Looks up the adapter from the container. Prioritizes the consuming app's
   * adapters over the addon's adapters.
   *
   * @method _lookupAdapter
   * @param {String} adapterName
   * @private
   * @return {Adapter} a local adapter or an adapter from the addon
   */
  _lookupAdapter(adapterName) {
    assert('[ember-metrics] Could not find metrics adapter without a name.', adapterName);

    const dasherizedAdapterName = dasherize(adapterName);
    const availableAdapter = getOwner(this).lookup(`ember-metrics@metrics-adapter:${dasherizedAdapterName}`);
    const localAdapter = getOwner(this).lookup(`metrics-adapter:${dasherizedAdapterName}`);

    const adapter = localAdapter || availableAdapter;
    assert(`[ember-metrics] Could not find metrics adapter ${adapterName}.`, adapter);

    return adapter;
  }

  /**
   * Predicate that Filters out adapters that should not be activated in the
   * current application environment. Defaults to all environments if the option
   * is `all` or undefined.
   *
   * @method _filterEnvironments
   * @param {Object} adapterOption
   * @param {String} appEnvironment
   * @private
   * @return {Boolean} should an adapter be activated
   */
  _filterEnvironments(adapterOption, appEnvironment) {
    let { environments } = adapterOption;

    if (typeOf(environments) === 'boolean') {
      return environments;
    } else if (typeOf(environments) === 'function') {
      return environments();
    }
        
    environments = environments || ['all'];
    const wrappedEnvironments = emberArray(environments);
    return wrappedEnvironments.indexOf('all') > -1 || wrappedEnvironments.indexOf(appEnvironment) > -1;
  }
}
