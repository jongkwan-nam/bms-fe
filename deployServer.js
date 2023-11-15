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

  async deleteFile(remoteFile) {
    console.log(`Deleting ${remoteFile}`);
    try {
      await this.client.delete(remoteFile);
    } catch (err) {
      console.error('Deleting failed:', err);
    }
  }
}

const getAllFiles = (dir) =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
  }, []);

(async () => {
  const parsedURL = new URL('sftp://hso10:handy21@123.212.190.176');
  const port = parsedURL.port || 22;
  const { host, username, password } = parsedURL;

  //* Open the connection
  const client = new SFTPClient();
  await client.connect({ host, port, username, password });

  //* List working directory files
  // await client.listFiles('.');

  const files = getAllFiles('./dist');
  for (let file of files) {
    let serverPath = './webapps/bms/fe' + file.replace('dist', '').replace(/\\/gi, '/');
    // console.log(file, serverPath);

    await client.uploadFile(file, serverPath);
  }

  //* Upload local file to remote file
  // await client.uploadFile('./local.txt', './remote.txt');

  //* Download remote file to local file
  // await client.downloadFile('./remote.txt', './download.txt');

  //* Delete remote file
  // await client.deleteFile('./remote.txt');

  //* Close the connection
  await client.disconnect();

  console.log('Completed', new Date());
})();
