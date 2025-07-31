## Getting Started

Prerequisites:

- Install latest version of nodejs
- Install latest version of npm
- Install visual studio code

Optional but recommended:

- Install fork ( git client ) 
    If you are not using any git client software, you can install latest version of git and connect with your visual studio
    to do all version controlling.

- Install react developer tools for your browser

After cloning repository first run this command from terminal window:
```
npm install
```
After all modules are installed you can start with development.

In the project directory you can run following commands:

```bash
npm start
```
Starts the development server.
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
The page will reload if you make edits.
You will also see any lint errors in the console.

```bash
npm run build
```
This will create a production build of your app in the build/ folder of your project.
Remember that this is only necessary before deploying to production. For normal development, use npm start.
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.

```bash
npm test
```
Starts the test runner.

```bash
npm run eject
```
Removes this tool and copies build dependencies, configuration files
and scripts into the app directory. If you do this, you can’t go back!

Your app is ready to be deployed!

#### About folder hierarchy

Public folder contains index.html and subfolder media.
- Media folder should contain images, video files, gifs or any other form of meadia used in project

Src folder will contain all source files for project

- Components should contain react components
- Services should contain API related code
- Styles all project style files (each component should have separate css file)

Do not edit index.js file (inside src folder). It is entry point and there is no need to temper with it.
It is rendering just our App component which should be our whole application.






