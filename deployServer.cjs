const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

class SFTPClient {
  constructor() {
    this.client = new Client();
  }

  async connect(options) {
    console.log(`Connecting to ${options.host}:${options.port}`);
    try {
      await this.client.connect(options);
    } catch (err) {
      console.log('Failed to connect:', err);
    }
  }

  async disconnect() {
    await this.client.end();
  }

  async listFiles(remoteDir, fileGlob) {
    console.log(`Listing ${remoteDir} ...`);
    let fileObjects;
    try {
      fileObjects = await this.client.list(remoteDir, fileGlob);
    } catch (err) {
      console.log('Listing failed:', err);
    }

    const fileNames = [];

    for (const file of fileObjects) {
      if (file.type === 'd') {
        console.log(`${new Date(file.modifyTime).toISOString()} PRE ${file.name}`);
      } else {
        console.log(`${new Date(file.modifyTime).toISOString()} ${file.size} ${file.name}`);
      }

      fileNames.push(file.name);
    }

    return fileNames;
  }

  async uploadFile(localFile, remoteFile) {
    // console.log(`Uploading ${localFile} to ${remoteFile} ...`);
    try {
      await this.client.put(localFile, remoteFile);
    } catch (err) {
      console.error('Uploading failed:', err);
    }
  }

  async downloadFile(remoteFile, localFile) {
    console.log(`Downloading ${remoteFile} to ${localFile} ...`);
    try {
      await this.client.get(remoteFile, localFile);
    } catch (err) {
      console.error('Downloading failed:', err);
    }
  }
}

const getAllFiles = (dir) =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
  }, []);

const ftpServerUrl = 'sftp://hso10:handy21@123.212.190.176';
const bmsFePath = './webapps/bms/fe/10.30.8.83';
const localDistName = 'dist';

(async () => {
  const parsedURL = new URL(ftpServerUrl);
  const port = parsedURL.port || 22;
  const { host, username, password } = parsedURL;

  const client = new SFTPClient();
  await client.connect({ host, port, username, password });

  const files = getAllFiles('./' + localDistName);
  for (let file of files) {
    let serverPath = bmsFePath + file.replace(localDistName, '').replace(/\\/gi, '/');

    await client.uploadFile(file, serverPath);
  }
  console.log(`Uploaded ${files.length} files to ${bmsFePath}`);

  await client.disconnect();

  console.log('Completed', new Date());
})();
