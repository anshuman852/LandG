const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const upload = require('./drive/upload.js');
const utils = require('./drive/utils.js');

const CronJob = require('cron').CronJob;
const cstamp = require('console-stamp')(console, 'HH:MM:ss.l');

const folderId = '1L8zMRN7lH332BzazlCUyRa-QWYG2_cEy';

console.log('Service:', 'started');
console.log('Listen for change on ./data/');

// TODO - RECURSION FOR FILE INSIDE FOLDER INSIDE DATA FOLDER ITSELF
function main(){
  checkDataFolder();

  fs.readdir('data', (err, files) => {
    files.forEach(file => {
      if (fs.statSync(`./data/${file}`).isDirectory()) {
        utils.createFolder(`./data/${file}`, folderId)
      } else {
        upload.uploadGoogleDriveFile(folderId, {filePath: `./data/${file}`, mimeType: mime.lookup(`./data/${file}`) });
      }
    });
  });
}

function checkDataFolder(){
  try { fs.mkdirSync(path.resolve('./data')) } catch (err) { if (err.code !== 'EEXIST') throw err }
}

/**
 * Cron ranges
 * Seconds: 0-59
 * Minutes: 0-59
 * Hours: 0-23
 * Day of Month: 1-31
 * Months: 0-11 (Jan-Dec)
 * Day of Week: 0-6 (Sun-Sat)
 */
new CronJob('*/15 * * * * *', function() {
  main();
}, null, true, 'America/Los_Angeles'); // The timezone doesn't change anything here.
