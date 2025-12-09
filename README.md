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
* You can set up a GitHub Actions workflow to automatically build and publish your game with the latest updates (see GitHub Actions Configuration).

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
	The web server with the running interpreter will automatically track the build update and initiate a reload of the page with the new version of the game. \
	At any time, you can open the menu in the interpreter interface and expand the Debugging section to see additional information about the running game. The information is constantly updated.
6. Continue developing the game and debugging it in the running interpreter. In parallel, you can use the version control system to save the development history. Binary builds of the game will not be included in the Git history.
7. At any time, you can extract the text of descriptions, actions, string literals, and comments from the game's source code to proofread it separately from the programming language constructs:
	```shell
	npm run extract
	```
8. Once the game is ready to be published (or a major update), you can create (or update) an iFiction record with the game's metadata:
	```shell
	npm run ifiction
	```
	Enter the data that will be requested. See the [Treaty of Babel](https://babel.ifarchive.org) for more details.
9. Once the game is ready, you can build the release as an archive:
	```shell
	npm run release
	```
	This archive is suitable for running in UrqW. \
	Or you can add the game repository to the UrqW instance repository as a Git submodule. The template structure meets the necessary UrqW requirements for adding games as submodules.

For details, please refer to the UrqW documentation.

## GitHub Actions Configuration

The game template also includes a pre-configured GitHub Actions workflow file. This allows you to configure automatic build and publish of the game with every push to the master branch.

The file is located in: .github/workflows/game-publish-github-packages.yml

To use this workflow, you need to configure GitHub Pages in your repository. To do this, go to Settings, then Pages (under the Code and automation heading). You can also directly open the page at `https://github.com/%OWNER%/%REPO%/settings/pages`.

On this page, under the Build and deployment heading in the Source menu, select GitHub Actions.

After this, with every push to the master branch, GitHub Actions will automatically archive the urqw/ folder, and the archived file (urqw.zip) will be available at `https://%OWNER%.github.io/%REPO%/urqw.zip`.

This game package with the most recent content updates can then be run in latest UrqW engine at \
`https://urqw.github.io/UrqW/?url=https://%OWNER%.github.io/%REPO%/urqw.zip`.

This way, you can publish games without relying on any UrqW catalogs, and always provide a permanent direct link to the version of the game with the latest updates. However, you may still add your game to UrqW catalogs to reach a wider audience.

If you don't need the GitHub Actions workflow, simply remove the corresponding configuration file from the project.

## License

UrqW Game Template - a new game template for the UrqW text-based game engine.

Written in 2025 by Nikita Tseykovets <tseikovets@rambler.ru>

To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.

You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
