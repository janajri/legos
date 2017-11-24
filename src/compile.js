const fs = require('fs')
const css = require('css')
const path = require('path')

const responsve = stream('responsive')
const global = stream('global')

console.log(css.stringify({
	type: 'stylesheet',
	stylesheet: {
		rules: [
			...global,
			...responsve,
			{
				type: "media",
				media: "(min-width: 30rem)",
				rules: prefix('s', responsve),
			},
			{
				type: "media",
				media: "(min-width: 48rem)",
				rules: prefix('m', responsve),
			},
			{
				type: "media",
				media: "(min-width: 75rem)",
				rules: prefix('l', responsve),
			},
		]
	}
}))

function stream(directory) {
	return fs
	.readdirSync(path.join(__dirname, directory))
	.map(file => path.join(__dirname, directory, file))
	.map(file => fs.readFileSync(file))
	.map(data => data.toString())
	.map(data => css.parse(data))
	.map(s => s.stylesheet.rules)
	.reduce((collect, rules) => collect.concat(rules), [])
}

function prefix(prefix, rules) {
	return rules.map(rule => {
		const next = Object.assign({}, rule)
		next.selectors = rule.selectors.map(s => s.replace('.', '.' + prefix + '-'))
		return next
	})
}