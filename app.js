const fs = require('fs')
const path = require('path')
const readline = require('readline');
const { google } = require('googleapis');
const mime = require('mime-types');
const CronJob = require('cron').CronJob;
const cstamp = require('console-stamp')(console, 'HH:MM:ss.l');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

const folderId = '1L8zMRN7lH332BzazlCUyRa-QWYG2_cEy';

function main(){
  try { fs.mkdirSync(path.resolve('./data')) } catch (err) { if (err.code !== 'EEXIST') throw err }

  console.log('Checking data folder...');
  fs.readdir('data', (err, files) => {
    files.forEach(file => {
      console.log(file);
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
              console.log('File uploaded.');
              fs.unlink('data/' + file, (err) => {
                if (err) throw err;
                console.log('data/' + file + ' was deleted');
              });
            }
          });

        });
      });
      console.log('done');
    });
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
