const FeStorage = {
  local: {
    set: (name, value) => {
      localStorage.setItem(name, value);
    },
    setObject: (name, valueObject) => {
      localStorage.setItem(name, JSON.stringify(valueObject));
    },
    get: (name, defaultValue) => {
      let value = localStorage.getItem(name);
      return value !== null ? value : defaultValue ? defaultValue : '';
    },
    getNumber: (name, defaultValue) => {
      return Number(FeStorage.local.get(name, defaultValue));
    },
    getBoolean: (name, defaultValue) => {
      let value = FeStorage.local.get(name, defaultValue);
      return value === true || value === 'true' || value === 'on' || value === 'yes' || value === 'Y';
    },
    getArray: (name, defaultValue) => {
      return FeStorage.local.get(name, defaultValue).split(',');
    },
    getObject: (name, defaultValue) => {
      return JSON.parse(FeStorage.local.get(name, defaultValue));
    },
    remove: (name) => {
      localStorage.removeItem(name);
    },
    clear: () => {
      localStorage.clear();
    },
  },
  session: {
    set: (name, value) => {
      sessionStorage.setItem(name, value);
    },
    setObject: (name, valueObject) => {
      localStorage.setItem(name, JSON.stringify(valueObject));
    },
    get: (name, defaultValue) => {
      let value = sessionStorage.getItem(name);
      return value !== null ? value : defaultValue ? defaultValue : '';
    },
    getNumber: (name, defaultValue) => {
      return Number(FeStorage.session.get(name, defaultValue));
    },
    getBoolean: (name, defaultValue) => {
      let value = FeStorage.session.get(name, defaultValue);
      return value === true || value === 'true' || value === 'on' || value === 'yes' || value === 'Y';
    },
    getArray: (name, defaultValue) => {
      return FeStorage.session.get(name, defaultValue).split(',');
    },
    getObject: (name, defaultValue) => {
      let value = FeStorage.session.get(name, defaultValue);
      return value === null || value === '' ? defaultValue : JSON.parse(value);
    },
    remove: (name) => {
      sessionStorage.removeItem(name);
    },
    clear: () => {
      sessionStorage.clear();
    },
  },
};

export default FeStorage;
