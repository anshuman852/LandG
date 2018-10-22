# LandG
You will need to have the following app installed:
- **Nodejs**
- **Npm**

You also need to have a Google account with Google Drive enabled.


## Step 1: Turn on the Drive API

<a href="https://developers.google.com/drive/api/v3/quickstart/nodejs">Click this link and follow the Step 1.</a>

Then you need to download the credentials.json file and place it in the root folder as they told you.

## Step 2: Install npm library

Use this command in the root folder of the project:

``` sh
$ npm install
```

## Step 3: Edit the folder id where the file will go in your drive

* Visit [Google Drive](https://drive.google.com).
   * Create a new folder. The bot will upload files inside this folder.
   * Open the folder.
   * The URL will be something like `https://drive.google.com/drive/u/0/folders/012a_345bcdefghijk`. Copy the part after `folders/` (`012a_345bcdefghijk`). This is the `folderId` you need.

   * Then edit app.js and replace the folderid variable (line 12)

``` js
const folderId = '012a_345bcdefghijk';
```

If you get an error like :

``` sh
errors:
   [ { domain: 'global',
       reason: 'notFound',
       message: 'File not found: 1L8zMRN7lH332BzazlCUyRa-QWYG2_cEys.',
       locationType: 'parameter',
       location: 'fileId' } ]
```

This inform you that your folderid is wrong.

## Step 4: Run the app and enjoy

Now simply run this command and send your file to the data folder:

``` sh
$ nodejs app.js
```

On the first run, once an file is added to the data folder, you'll be asked
in the console to enter a code which will allow this app to push data to your
google drive account. Simply follow what will be written on your terminal.

## WARNING

Don't create new file manually into the data folder.
Like don't create a text file inside manually else once the file will be created
it will be pushed to google drive and deleted after it. In a result, you won't
have the needed time to add content into the file.

I highly recommend you to create a file outside of the data folder and then
copy/paste or move it to the data folder.

## Contributing

I love contributions! So if you want to add a new feature, please do it.
