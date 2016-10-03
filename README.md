# NOSBot

## Setup
Step-by-step guide to getting NOSBot up and running. This guide is written for macOS but installation on Windows and Linux is also possible.

Clone this repo
```
git clone https://github.com/luukschipperheyn/nosbot.git
```

Install Node.js on your machine ([detailed instructions](https://github.com/creationix/nvm#install-script)): 
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
```
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
```
```
nvm install node
```
Create a Firebase account at [https://firebase.google.com/](https://firebase.google.com/)

Go to the [Firebase console](https://console.firebase.google.com/) and create a new project

In the database menu, go to the 'rules' tab, replace the rules with the following and publish: (this is the least secure but the most simple way to get the app working)
```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
Get a service-account json file by following the 'add Firebase to your app' instructions on [this page](https://firebase.google.com/docs/server/setup#add_firebase_to_your_app)

rename the file to `service-account.json`  and move it to the project root (next to this `README.md` file)

In your developer console, go to your new app and click 'add Firebase to your web app'. Copy the config property values into `config.json`

Install nosbot:
```
npm install
```

## Database seeding
To populate the database, do the following:

First, copy all subtitle files you want to use to the `/data` directory. Then, from the project root directory, run:
```
node src/DatabaseSeeder.js
```

## Running the app
To start the server, run:
```
npm run serve
```
The front end will then be available at `http://localhost:9090/`.

