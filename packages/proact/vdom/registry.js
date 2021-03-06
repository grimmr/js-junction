/* (C) Copyright 2017–2018 Robert Grimm */

import { DuplicateBinding, InvalidArgType, InvalidArgValue } from '@grr/err';
import punning from '@grr/err/punning';
import { isHtmlElement } from '../spec/elements';

const { toString } = Function.prototype;
const IS_CLASS = /^class /;

const bindings = new Map();

export const define = punning(function define(name, factory) {
  // To support both ReactLike and html-like component naming, leave name as is.
  // However, isHTML() internally normalizes to lower case for correctness.
  if (!name || isHtmlElement(name)) {
    throw InvalidArgValue({ name }, 'should be a non-empty, non-HTML name');
  } else if (typeof factory !== 'function') {
    throw InvalidArgType({ factory }, 'a factory function');
  } else if (IS_CLASS.test(toString.call(factory))) {
    throw InvalidArgType(
      { factory },
      'not',
      'a class constructor, which requires "new")'
    );
  } else if (bindings.has(name)) {
    throw DuplicateBinding(name, bindings.get(name), factory);
  }

  bindings.set(name, factory);
});

export function lookup(name) {
  return bindings.get(name);
}
