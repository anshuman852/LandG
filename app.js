const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const upload = require('./drive/upload.js');
const utils = require('./drive/utils.js');

const CronJob = require('cron').CronJob;
const cstamp = require('console-stamp')(console, 'HH:MM:ss.l');

const folderId = '1L8zMRN7lH332BzazlCUyRa-QWYG2_cEy';

let running = 0;

console.log('Service:', 'started');
console.log('Listen for change on ./data/');

// TODO - RECURSION FOR FILE INSIDE FOLDER INSIDE DATA FOLDER ITSELF
function main(){
  checkDataFolder();

  listAndUpload();
}

function listAndUpload(){
  fs.readdir('data', (err, files) => {
    files.forEach(file => {
      if (fs.statSync(`./data/${file}`).isDirectory()) {
        utils.createFolder(`./data/${file}`, folderId)
      } else {
        running++;
        upload.uploadGoogleDriveFile(folderId, {filePath: `./data/${file}`, mimeType: mime.lookup(`./data/${file}`) });
      }
    });
  });
}

function mRunningRemove(){
  running--;
}

function checkDataFolder(){
  try { fs.mkdirSync(path.resolve('./data')) } catch (err) { if (err.code !== 'EEXIST') throw err }
}

new CronJob('*/15 * * * * *', function() {
  if(running == 0){
    main();
  }
}, null, true, 'America/Los_Angeles'); // The timezone doesn't change anything here.

module.exports.mRunningRemove = mRunningRemove;
