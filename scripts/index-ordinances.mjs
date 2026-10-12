import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as pagefind from 'pagefind';

const siteDirectory = resolve(process.argv[2] || '_site');
const records = JSON.parse(await readFile(resolve(siteDirectory, 'assets/ordinance-search.json'), 'utf8'));
const { index, errors } = await pagefind.createIndex();
if (errors?.length || !index) throw new Error(errors?.join('\n') || 'Could not create ordinance index');

try {
  for (const record of records) {
    const { errors } = await index.addCustomRecord(record);
    if (errors?.length) throw new Error(errors.join('\n'));
  }
  const { errors } = await index.writeFiles({ outputPath: resolve(siteDirectory, 'pagefind') });
  if (errors?.length) throw new Error(errors.join('\n'));
  console.log(`Indexed ${records.length} ordinances from site.ordinances.`);
} finally {
  await pagefind.close();
}
