// Mock for native Expo modules on the web
export const NativeModulesProxy = {};
export const requireNativeModule = () => ({
  addListener: () => {},
  removeListeners: () => {},
});
export const EventEmitter = class {
  addListener() { return { remove: () => {} }; }
  removeListeners() {}
};
export const requireOptionalNativeModule = () => null;

export class UnavailabilityError extends Error {
  constructor(moduleName, methodName) {
    super(`The method or property ${moduleName}.${methodName} is not available on web.`);
    this.name = 'UnavailabilityError';
    this.code = 'ERR_UNAVAILABLE';
  }
}

export class CodedError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'CodedError';
    this.code = code;
  }
}

export const Platform = {
  OS: 'web',
  select: (obj) => obj.web || obj.default,
};

export default {
  NativeModulesProxy,
  requireNativeModule,
  EventEmitter,
  requireOptionalNativeModule,
  UnavailabilityError,
  CodedError,
  Platform,
};
