import {
  CONNECTION_MONITORING_INTERVAL,
  CONNECTION_TIMEOUT,
  LEGACY_BASE_ROUTE,
  MONITORING_INTERVAL,
} from './constants';

describe('Legacy constants', () => {
  test('LEGACY_BASE_ROUTE is the correct value', () => {
    expect(LEGACY_BASE_ROUTE()).toBe('/legacy');
  });

  test('MONITORING_INTERVAL is the correct value', () => {
    expect(MONITORING_INTERVAL()).toBe(50);
  });

  test('CONNECTION_TIMEOUT is the correct value', () => {
    expect(CONNECTION_TIMEOUT()).toBe(60000);
  });

  test('CONNECTION_MONITORING_INTERVAL is the correct value', () => {
    expect(CONNECTION_MONITORING_INTERVAL()).toBe(100);
  });
});
