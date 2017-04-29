import { parseString } from 'xml2js';
import { fetchData } from './utils';

export default (chromeStoreID, currentVersion) => new Promise((resolve, reject) =>
  fetchData(
    `https://clients2.google.com/service/update2/crx?x=id%3D${chromeStoreID}%26uc&prodversion=32`,
  ).then((res) => {
    if (res.statusCode === 200) {
      parseString(res.body, (err, result) => {
        const app = result.gupdate.app[0].$;
        if (app.status !== 'ok') return resolve(false);

        const { status, version: newestVersion } = result.gupdate.app[0].updatecheck[0].$;
        if (status !== 'ok') return resolve(false);

        if (newestVersion !== currentVersion) return resolve(true);
        return resolve(false);
      });
    } else {
      reject(`Failed to check current version of ${chromeStoreID}.`);
    }
  }),
);
