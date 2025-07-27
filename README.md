# UrqW Game Template

This is a template of a new game for the [UrqW](https://github.com/urqw/UrqW) text-based game engine.

This template assumes the use of additional development tools such as [Git](https://git-scm.com) and [Node.js with npm](https://nodejs.org). This is intended to automate routine actions.

However, game development for UrqW can be done without all of this. See the documentation of UrqW for more details.

## Usage

Preliminary preparation:

1. Clone the Game Template repository:
	```shell
	git clone https://github.com/urqw/game_template.git my_new_game
	cd my_new_game
	```
2. Install all dependencies:
	```shell
	npm install
	```
3. Create a manifest.json file for your new game:
	```shell
	npm run manifest
	```
	Enter the data that will be requested. \
	It is recommended to use UTF-8 encoding and URQ mode `urqw`. These are the parameters that are set when saving manifest. A new [IFID](https://babel.ifarchive.org) will be generated automatically (only when there is no other IFID in the manifest, so you can safely run the script several times).

Additional actions if desired:

* You can delete the .git directory and initialize the Git repository again to start your new game project from scratch.
* You can edit the package data in the package.json file to match it to your new game project.
* You can replace the license of this package with any other, as well as add or change other files.

Workflow:

1. All game data is stored in the urqw directory. This is where the game development takes place.
2. Open the UrqW documentation if needed:
	```shell
	npm run docs
	```
3. Make your first changes to the game files and build the project:
	```shell
	npm run build
	```
4. After the first build, run a local web server with an interpreter to debug the game you are developing:
	```shell
	npm start
	```
5. After significant changes to the project, rebuild it:
	```shell
	npm run build
	```
	The web server with the running interpreter will automatically track the build update and initiate a reload of the page with the new version of the game.
6. Continue developing the game and debugging it in the running interpreter. In parallel, you can use the version control system to save the development history. Binary builds of the game will not be included in the Git history.

For details, please refer to the UrqW documentation.
