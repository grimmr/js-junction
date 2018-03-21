/* (C) Copyright 2017–2018 Robert Grimm */

import {
  escapeAttribute,
  hyphenate as doHyphenate,
  isAttributeQuoted
} from '@grr/oddjob/strings';

import { maybe, memoize } from '@grr/oddjob/functions';
import Tags from '../spec/tags';
import typeAttribute from '../spec/attributes';

const hyphenate = memoize(doHyphenate);
const { isArray } = Array;
const { keys } = Object;

const {
  CommaSeparated,
  PresentAbsent,
  TrueFalse,
  TrueFalseMixed,
  TrueFalseUndefined,
  YesNo,
} = Tags.HTML.Attribute;

// -------------------------------------------------------------------------------------------------

function formatKeyBoolean(key, value) {
  return value ? `${key}=true` : `${key}=false`;
}

function formatKeyToken(key, value) {
  return `${key}=${value}`;
}

function formatKeyValue(key, value, separator = ' ') {
  if( isArray(value) ) {
    value = value
      .filter(el => el != null)
      .map(el => String(el).trim())
      .join(separator);
  } else {
    value = String(value).trim();
  }

  if( isAttributeQuoted(value) ) {
    return `${key}="${escapeAttribute(value)}"`;
  } else {
    return `${key}=${value}`;
  }
}

// -------------------------------------------------------------------------------------------------

const renderAttribute = maybe((key, value) => {
  key = hyphenate(key);

  switch( typeAttribute(key) ) {
    case PresentAbsent:
      return value ? key : null;
    case TrueFalse:
      return formatKeyBoolean(key, value);
    case TrueFalseMixed:
      if( value === 'mixed' ) return formatKeyToken(key, value);
      return formatKeyBoolean(key, value);
    case TrueFalseUndefined:
      if( value === 'undefined' ) return formatKeyToken(key, value);
      return formatKeyBoolean(key, value);
    case YesNo:
      return formatKeyToken(key, value ? 'yes' : 'no');
    case CommaSeparated:
      return formatKeyValue(key, value, ',');
    default:
      return formatKeyValue(key, value);
  }
});

export default function* renderAttributes(attributes) {
  for( const key of keys(Object(attributes)) ) {
    const attribute = renderAttribute(key, attributes[key]);
    if( attribute ) yield attribute;
  }
}
