const canUseMetrics = (typeof window !== 'undefined' && window.doNotTrack !== '1') &&
  (typeof navigator !== 'undefined' && navigator.doNotTrack !== '1')

export default canUseMetrics;
