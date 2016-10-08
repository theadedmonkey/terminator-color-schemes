import rp from 'request-promise';
import cheerio from 'cheerio';
import url from 'url';
import fs from 'fs';

const URL_BASE = 'https://github.com/mbadolato/iTerm2-Color-Schemes/blob/master/terminator';

const URL_BASE_RAW = 'https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/terminator/';

function parseSchemaNames($) {
  return $('body')
    .find('a')
    .toArray()
    .map(a => $(a).prop('href'))
    .filter(href => href.endsWith('.config'))
    .map(href => href.substr(href.lastIndexOf('/') + 1));
}

function createRawUrls(schemaNames) {
  return schemaNames
    .map(schemaName => url.resolve(URL_BASE_RAW, schemaName));
}

function fetchSchemas(uris) {
  return Promise.all(uris.map(uri => rp(uri)));
}

// schema strings needs to be shifted two spaces just before
// the first \n character
function formatSchemas(schemas) {
  return schemas.map(schema => [schema.substr(0, 1), '  ', schema.substr(1)].join(''));
}

function createConfigFile(schemas) {
  fs.writeFileSync('config', fs.readFileSync('config_default', 'utf8'));
  fs.appendFileSync('config', schemas.join(''));
}

function main() {
  const options = {
    uri: URL_BASE,
    transform: body => cheerio.load(body),
  };
  rp(options)
    .then(parseSchemaNames)
    .then(createRawUrls)
    .then(fetchSchemas)
    .then(formatSchemas)
    .then(createConfigFile)
    .then(() => console.log('done'))
    .catch(console.log);
}

// main();
