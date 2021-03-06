/* (C) Copyright 2017 Robert Grimm */

import { InvalidArgType } from '@grr/err';

const { apply } = Reflect;
const { create } = Object;
const { hasOwnProperty } = Object.prototype;
const { isArray } = Array;

export function toKeyPath(path) {
  const type = typeof path;

  if (path == null) {
    return [];
  } else if (isArray(path)) {
    return path;
  } else if (type === 'string') {
    return path.split('.');
  } else if (type === 'number' || type === 'symbol') {
    return [path];
  } else {
    throw InvalidArgType('path', path, 'a string, symbol, or array');
  }
}

function doWithKeyPath(existingOnly, root, path, task) {
  if (root == null || typeof root !== 'object')
    throw InvalidArgType('root', root, 'an object');

  const keys = toKeyPath(path);
  const { length } = keys;

  let enclosing = root;
  for (let index = 0; index < length - 1; index++) {
    const key = keys[index];

    if (!hasOwnProperty.call(enclosing, key)) {
      if (existingOnly) return void 0;
      enclosing = enclosing[key] = create(null);
    } else {
      enclosing = enclosing[key];

      if (enclosing == null || typeof enclosing !== 'object') {
        throw InvalidArgType(
          `root.${keys.slice(0, index + 1).join('.')}`,
          enclosing,
          'an object'
        );
      }
    }
  }

  const key = keys[length - 1];
  if (existingOnly && !hasOwnProperty.call(enclosing, key)) {
    return void 0;
  }

  const state = [enclosing, key, enclosing[key]];
  if (!task) return state;
  return apply(task, enclosing, state);
}

export const withKeyPath = (root, path, task) =>
  doWithKeyPath(false, root, path, task);
export const withExistingKeyPath = (root, path, task) =>
  doWithKeyPath(true, root, path, task);
