import { unshift } from './stringUtils';

/**
 *
 * @param {string} id
 * @returns
 */
export const isNullID = (id = null) => id === null || id.trim().replace(/0/g, '') === '';

/**
 *
 * @param {string} id
 * @returns
 */
export const isNotNullID = (id) => !isNullID(id);

/**
 *
 * @param {string} apprid
 * @param {number} index
 */
export const getObjectID = (apprid, index) => {
  return apprid.substring(0, 17) + unshift(index, 3, '0');
};
