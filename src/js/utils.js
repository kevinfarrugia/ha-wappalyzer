'use strict';
/* eslint-env browser */
/* globals chrome */

const Utils = {
  agent: 'chrome',

  /**
   * Use promises instead of callbacks
   * @param {Object} context
   * @param {String} method
   * @param  {...any} args
   */
  promisify(context, method, ...args) {
    return new Promise((resolve, reject) => {
      context[method](...args, (...args) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        resolve(...args);
      });
    });
  },

  /**
   * Open a browser tab
   * @param {String} url
   * @param {Boolean} active
   */
  open(url, active = true) {
    chrome.tabs.create({ url, active });
  },

  /**
   * Get value from local storage
   * @param {String} name
   * @param {string|mixed|null} defaultValue
   */
  async getOption(name, defaultValue = null) {
    try {
      try {
        const managed = await Utils.promisify(
          chrome.storage.managed,
          'get',
          name
        );

        if (managed[name] !== undefined) {
          return managed[name];
        }
      } catch (error) {
        console.error(
          'wappalyzer | utils | managed storage not available',
          error
        );
      }

      const option = await Utils.promisify(chrome.storage.local, 'get', name);

      if (option[name] !== undefined) {
        return option[name];
      }
    } catch (error) {
      console.error('wappalyzer | utils |', error);
    }

    return defaultValue;
  },

  /**
   * Set value in local storage
   * @param {String} name
   * @param {String} value
   */
  async setOption(name, value) {
    try {
      await Utils.promisify(chrome.storage.local, 'set', {
        [name]: value
      });
    } catch (error) {
      console.error('wappalyzer | utils |', error);
    }
  },

  /**
   * Apply internationalization
   */
  i18n() {
    Array.from(document.querySelectorAll('[data-i18n]')).forEach(
      (node) => (node.innerHTML = chrome.i18n.getMessage(node.dataset.i18n))
    );
  },

  sendMessage(source, func, args) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          source,
          func,
          args: args ? (Array.isArray(args) ? args : [args]) : []
        },
        (response) => {
          chrome.runtime.lastError
            ? reject(chrome.runtime.lastError)
            : resolve(response);
        }
      );
    });
  },

  globEscape(string) {
    return string.replace(/\*/g, '\\*');
  }
};
