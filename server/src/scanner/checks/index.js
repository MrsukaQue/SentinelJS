import { contentCheck } from './content.js';
import { cookieCheck } from './cookies.js';
import { corsCheck } from './cors.js';
import { disclosureCheck } from './disclosure.js';
import { headerCheck } from './headers.js';
import { transportCheck } from './transport.js';

export const checks = [
  headerCheck,
  cookieCheck,
  transportCheck,
  corsCheck,
  disclosureCheck,
  contentCheck,
];
