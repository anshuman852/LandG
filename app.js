const fs = require('fs')
const path = require('path')
const readline = require('readline');
const { google } = require('googleapis');
const mime = require('mime-types');

let fsWait = false;
let media = null;
let fileTitle = null;

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

function main(){
  try { fs.mkdirSync(path.resolve('./data')) } catch (err) { if (err.code !== 'EEXIST') throw err }

  console.log('Watching for file changes on data.');
  fs.watch('data', (event, filename) => {
    if (filename) {
      if (fsWait) return;
      fsWait = setTimeout(() => {
        fsWait = false;
        try {
          if(fs.existsSync('data/' + filename)){
            console.log("File: " + filename);
            media = { mimeType: mime.lookup('data/' + filename), body: fs.createReadStream('data/' + filename) };
            fileTitle = filename;
            fs.readFile('credentials.json', (err, content) => {
              if (err) return console.log('Error loading client secret file:', err);
              authorize(JSON.parse(content), uploadIt);
            });
          }
        } catch (err) {
          console.error(err);
        }
      }, 500);
    } else {
      console.log('Error, no file.');
    }
  });
}

function uploadIt(auth){
  const drive = google.drive({version: 'v3', auth});
  const fileMetadata = { 'name': fileTitle };
  drive.files.create({
    resource: fileMetadata,
    media: media
  }, (err, file) => {
    if (err) {
      console.error(err);
    } else {
      console.log('File uploaded.');
      fs.unlink('data/' + fileTitle, (err) => {
        if (err) throw err;
        console.log('data/' + fileTitle + ' was deleted');
      });
    }
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

main();
