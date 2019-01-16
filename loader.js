const fs = require("fs");
const recursive = require('recursive-readdir');
const path = require("path");

function loader(modules, mfs) {
    const loadedDeps = [];
    const preLoadPackage = function (name) {
        if (name === 'fsevents') {
            return;
        }

        if (loadedDeps.indexOf(name) >= 0) {
            return;
        }
        loadedDeps.push(name);
        const packagePath = path.resolve('node_modules', name);
        const packageJson = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json')).toString());

        recursive(packagePath, function (err, files) {
            files.forEach(function (file) {
                var relativeFile = file;
                var paths = relativeFile.split(path.sep).slice(1);
                paths.reduce(function (currentPath, pathPart, index) {
                    currentPath += path.sep + pathPart;
                    if (index < paths.length - 1 && !mfs.existsSync(currentPath)) {
                        mfs.mkdirpSync(currentPath);
                    }
                    return currentPath;
                }, '');

                if (path.extname(relativeFile)) {
                    var content = fs.readFileSync(file, 'utf8');
                    mfs.writeFileSync(relativeFile, content || ' ');
                }
            });
        });
        Object.keys(packageJson.dependencies || {}).forEach(preLoadPackage);
    }

    modules.forEach(preLoadPackage)
}

module.exports = loader;
