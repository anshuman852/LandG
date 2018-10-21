const fs = require('fs');
const {google} = require('googleapis');
const driveAuth = require('./drive-auth.js');

function createFolder (filePath, parent) {
  console.log('Folder upload is under construction, dont use it for now.');
  /*
  driveAuth.call((err, auth) => {
    if (err) return reject(new Error('Failed to get OAuth client'))
    const drive = google.drive({version: 'v3', auth});

    drive.files.create({
      fields: 'id',
      resource: {
        mimeType: 'application/vnd.google-apps.folder',
        name: filePath.substring(filePath.lastIndexOf('/') + 1),
        parents: [parent]
      }
    },
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Folder id:', res.data.id);
      }
    });
  });
  */
}

function getSharableLink (fileId) {
  driveAuth.call((err, auth) => {
    if (err) {
      if (err) return reject(new Error('Failed to get OAuth client'))
    }
    const drive = google.drive({version: 'v3', auth});

    drive.permissions.create({
      fileId: fileId,
      resource: {
        role: 'reader',
        type: 'anyone'
      }
    },
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Link ->', 'https://drive.google.com/uc?id=' + fileId + '&export=download');
      }
    });
  });
}

module.exports.createFolder = createFolder;
module.exports.getSharableLink = getSharableLink;
