import { BrowserWindow, session } from 'electron';
import fs from 'fs';
import path from 'path';
import semver from 'semver';

import downloadChromeExtension from './downloadChromeExtension';
import { getPath } from './utils';

let IDMap = {};
const getIDMapPath = () => path.resolve(getPath(), 'IDMap.json');
if (fs.existsSync(getIDMapPath())) {
  try {
    IDMap = JSON.parse(fs.readFileSync(getIDMapPath(), 'utf8'));
  } catch (err) {
    console.error('electron-devtools-installer: Invalid JSON present in the IDMap file');
  }
}

const install = (extensionReference, forceDownload = false) => {
  if (process.type !== 'browser') {
    return Promise.reject(
      new Error('electron-devtools-installer can only be used from the main process'),
    );
  }

  if (Array.isArray(extensionReference)) {
    return extensionReference.reduce(
      (accum, extension) => accum.then(() => install(extension, forceDownload)),
      Promise.resolve(),
    );
  }
  let chromeStoreID;
  if (typeof extensionReference === 'object' && extensionReference.id) {
    chromeStoreID = extensionReference.id;
    const electronVersion = process.versions.electron.split('-')[0];
    if (!semver.satisfies(electronVersion, extensionReference.electron)) {
      return Promise.reject(
        new Error(
          `Version of Electron: ${electronVersion} does not match required range ${extensionReference.electron} for extension ${chromeStoreID}`,
        ), // eslint-disable-line
      );
    }
  } else if (typeof extensionReference === 'string') {
    chromeStoreID = extensionReference;
  } else {
    return Promise.reject(
      new Error(`Invalid extensionReference passed in: "${extensionReference}"`),
    );
  }
  const extensionName = IDMap[chromeStoreID];
  let extensionInstalled = extensionName;

  // For Electron >=9.
  if (session.defaultSession.getExtension) {
    extensionInstalled =
      extensionInstalled &&
      session.defaultSession.getAllExtensions().find((e) => e.name === extensionName);
  } else {
    extensionInstalled =
      extensionInstalled &&
      BrowserWindow.getDevToolsExtensions &&
      BrowserWindow.getDevToolsExtensions().hasOwnProperty(extensionName);
  }

  if (!forceDownload && extensionInstalled) {
    return Promise.resolve(IDMap[chromeStoreID]);
  }
  return downloadChromeExtension(chromeStoreID, forceDownload).then((extensionFolder) => {
    // Use forceDownload, but already installed
    if (extensionInstalled) {
      // For Electron >=9.
      if (session.defaultSession.removeExtension) {
        const extensionId = session.defaultSession.getAllExtensions().find((e) => e.name).id;
        session.defaultSession.removeExtension(extensionId);
      } else {
        BrowserWindow.removeDevToolsExtension(extensionName);
      }
    }

    // For Electron >=9.
    if (session.defaultSession.loadExtension) {
      return session.defaultSession.loadExtension(extensionFolder).then((ext) => {
        return Promise.resolve(ext.name);
      });
    }

    const name = BrowserWindow.addDevToolsExtension(extensionFolder); // eslint-disable-line

    fs.writeFileSync(
      getIDMapPath(),
      JSON.stringify(
        Object.assign(IDMap, {
          [chromeStoreID]: name,
        }),
      ),
    );
    return Promise.resolve(name);
  });
};

export default install;
export const EMBER_INSPECTOR = {
  id: 'bmdblncegkenkacieihfhpjfppoconhi',
  electron: '>=1.2.1',
};
export const REACT_DEVELOPER_TOOLS = {
  id: 'fmkadmapgofadopljbjfkapdkoienihi',
  electron: '>=1.2.1',
};
export const BACKBONE_DEBUGGER = {
  id: 'bhljhndlimiafopmmhjlgfpnnchjjbhd',
  electron: '>=1.2.1',
};
export const JQUERY_DEBUGGER = {
  id: 'dbhhnnnpaeobfddmlalhnehgclcmjimi',
  electron: '>=1.2.1',
};
export const ANGULARJS_BATARANG = {
  id: 'ighdmehidhipcmcojjgiloacoafjmpfk',
  electron: '>=1.2.1',
};
export const VUEJS_DEVTOOLS = {
  id: 'nhdogjmejiglipccpnnnanhbledajbpd',
  electron: '>=1.2.1',
};
export const REDUX_DEVTOOLS = {
  id: 'lmhkpmbekcpmknklioeibfkpmmfibljd',
  electron: '>=1.2.1',
};
export const REACT_PERF = {
  id: 'hacmcodfllhbnekmghgdlplbdnahmhmm',
  electron: '>=1.2.6',
};
export const CYCLEJS_DEVTOOL = {
  id: 'dfgplfmhhmdekalbpejekgfegkonjpfp',
  electron: '>=1.2.1',
};
export const APOLLO_DEVELOPER_TOOLS = {
  id: 'jdkknkkbebbapilgoeccciglkfbmbnfm',
  electron: '>=1.2.1',
};
export const MOBX_DEVTOOLS = {
  id: 'pfgnfdagidkfgccljigdamigbcnndkod',
  electron: '>=1.2.1',
};
export const METEOR_DEVTOOLS = {
  id: 'ibniinmoafhgbifjojidlagmggecmpgf',
  electron: '>1.2.1',
}
