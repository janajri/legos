const path = require('path')
const webpack = require('webpack')
const live = process.env.NODE_ENV === "production";
const index = ['css-loader', path.join(__dirname, 'src', 'index.css')];

if (live) {
    index.unshift("file-loader?name=[name].[ext]", "extract-loader");
} else {
    index.unshift("style-loader");
}
console.log(index)

module.exports = {
	// devtool: 'source-map',
    output: {
		path: path.join(__dirname, 'dist'),
        filename: "index.js"
    },
	entry: [
		index.join('!')
	]

}