const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');
const mime = require('mime-types');
var _ = require('lodash');
const CronJob = require('cron').CronJob;
const util = require('util');
const async = require('async');
const cstamp = require('console-stamp')(console, 'HH:MM:ss.l');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

const folderId = '1L8zMRN7lH332BzazlCUyRa-QWYG2_cEy';

var permissions = [
  {
    'type': 'anyone',
    'role': 'reader'
  }
];

function main(){
  try { fs.mkdirSync(path.resolve('./data')) } catch (err) { if (err.code !== 'EEXIST') throw err }

  fs.readdir('data', (err, files) => {
    files.forEach(file => {
      let media = { mimeType: mime.lookup('data/' + file), body: fs.createReadStream('data/' + file) };
      fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), function(auth){
          const drive = google.drive({version: 'v3', auth});
          const fileMetadata = { 'name': file, parents: [folderId] };
          drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
          }, (err, f) => {
            if (err) {
              console.error(err);
            } else {
              console.log(file + ' was uploaded.');
              fs.unlink('data/' + file, (err) => { if (err) throw err; });
              getLinkOfFile(f.data.id, drive);
              if(_.includes(file, 'share')){
                changePermission(f.data.id, drive);
                console.log("This is a public file.");
              } else {
                console.log("This is a private file.");
              }
              getLinkOfFile(f.data.id, drive);
            }
          });
        });
      });
    });
  });
}

function getLinkOfFile(fileId, drive){
  drive.files.get({
    fileId: fileId,
    fields: 'webViewLink'
  }, function(err,result){
    if(err) console.log(err)
    else console.log('Download link: ', result.data.webViewLink)
  });
}

function changePermission(fileId, drive){
  async.eachSeries(permissions, function (permission, permissionCallback) {
    drive.permissions.create({
      resource: permission,
      fileId: fileId,
      fields: 'id',
    }, function (err, res) {
      if (err) {
        console.error(err);
        permissionCallback(err);
      } else {
        permissionCallback();
      }
    });
  }, function (err) {
    if (err) console.error(err)
  });
}

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
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
new CronJob('*/10 * * * * *', function() {
  main();
}, null, true, 'America/Los_Angeles'); // The timezone doesn't change anything here.
