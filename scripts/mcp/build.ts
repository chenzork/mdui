import { buildComponents } from './build-components.js';
import { buildCssClasses } from './build-css-classes.js';
import { buildCssVariables } from './build-css-variables.js';
import { buildDocuments } from './build-documents.js';
import { buildIcons } from './build-icons.js';

const main = async () => {
  await buildComponents();
  await buildCssClasses();
  await buildCssVariables();
  await buildDocuments();
  await buildIcons();
};

main();
