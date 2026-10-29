// Every card file, gathered into one list. To add a new file of cards
// (e.g. data/cards/myarc.js exporting CARDS), import it here and add it to
// the list. Order doesn't matter; card ids must be unique across all files.

import { CARDS as STARTER } from './starter.js';
import { CARDS as OFFICE } from './office.js';
import { CARDS as SEASONAL } from './seasonal.js';
import { CARDS as MERGER } from './merger.js';
import { CARDS as RANSOMWARE } from './ransomware.js';
import { CARDS as CLOUD } from './cloud.js';
import { CARDS as AUDIT } from './audit.js';
import { CARDS as AI } from './ai.js';

export const ALL_CARDS = [...STARTER, ...OFFICE, ...SEASONAL, ...MERGER, ...RANSOMWARE, ...CLOUD, ...AUDIT, ...AI];
