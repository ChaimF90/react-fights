const express = require("express");
const app = express();
const MemoryFs = require("memory-fs");
const mfs = new MemoryFs();
const webpack = require("webpack");
const bodyParser = require("body-parser");
const loader = require("./loader");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const code = `
import React from "react";
import ReactDOM from "react-dom";

const Index = () => {
  return <div>Hello React!</div>;
};

ReactDOM.render(<Index />, document.getElementById("index"));
`;

mfs.mkdirpSync('/Users/chaim/developer/personal/react-fights')
mfs.writeFileSync('/Users/chaim/developer/personal/react-fights/index.js', code, 'utf-8')

const compiler = webpack({
    entry: "/Users/chaim/developer/personal/react-fights/index.js",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/react", "@babel/env"]
                    },
                },
            }
        ]
    },
});



compiler.inputFileSystem = mfs;
compiler.outputFileSystem = mfs;

const deps = ["babel-loader",
    "@babel/preset-react",
    "react",
    "@babel/preset-env",
    "react-dom",
    "process",
    "webpack"];

loader(deps, mfs);

const createCompiler = (inputFile, outputFile, code) => {
    mfs.writeFileSync(`/Users/chaim/developer/personal/react-fights/${inputFile}`, code, 'utf-8')

    const compiler = webpack({
        entry: `/Users/chaim/developer/personal/react-fights/${inputFile}`,
        output: {
            filename: outputFile,
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/react", "@babel/env"]
                        },
                    },
                }
            ]
        },
    });



    compiler.inputFileSystem = mfs;
    compiler.outputFileSystem = mfs;
    return compiler;
}

app.get("/sample", (req, res) => {
    compiler.run((err, stats) => {
        if (err) {
            console.log(err);
        } else {
            const html = `
            <!DOCTYPE html>
            <html>
            <head>
            <title>Title of the document</title>
            </head>
            
            <body>
            <div id="index"></div>
                <script>
                    ${stats.compilation.assets["main.js"].source()}
                </script>
            </body>
            </html>
            `;
            res.json({ code: html });
        }
    })
});

app.post("/compile", (req, res) => {
    const outputFile = `${Math.floor((Math.random() * 100) + 1)}.js`;
    const myCompiler = createCompiler(`${Math.floor((Math.random() * 100) + 1)}.js`, outputFile, req.body.code);
    myCompiler.run((err, stats) => {
        if (err) {
            console.log(err);
        } else {
            const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Title of the document</title>
                </head>
            
                <body>
                    <div id="index"></div>
                    <script>
                        ${stats.compilation.assets[outputFile].source()}
                    </script>
                </body>
            </html>
            `;
            res.json({ code: html });
        }
    })
});


app.listen(5000, () => console.log("server is running on port 5000"));
