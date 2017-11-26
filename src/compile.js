const fs = require('fs')
const css = require('css')
const path = require('path')

const postcss = require('postcss')
const next = require('postcss-cssnext')
const nano = require('cssnano')

const OUTPUT_DIR = './dist'
clean()

const responsive = stream_rules('responsive')
const global = stream_rules('global')

const prefixed = {
	s: prefix('s', responsive),
	m: prefix('m', responsive),
	l: prefix('l', responsive),
}

const ast = {
	type: 'stylesheet',
	stylesheet: {
		rules: [
			...global,
			...responsive,
			{
				type: "media",
				media: "(min-width: 30rem)",
				rules: prefixed.s,
			},
			{
				type: "media",
				media: "(min-width: 48rem)",
				rules: prefixed.m,
			},
			{
				type: "media",
				media: "(min-width: 75rem)",
				rules: prefixed.l,
			},
		]
	}
}
write_css(css.stringify(ast))
write_list([
	...global,
	...responsive,
	...prefixed.s,
	...prefixed.m,
	...prefixed.l,
])

function write_list(rules) {
	const result =
		rules
		.map(r => r.selectors)
		.reduce((a, b) => a.concat(b))
		.filter(item => item[0] === ".") 
		.map(item => item.slice(1))
		.reduce((collect, item) => {
			collect[item] = true
			return collect
		}, {})
	write_file('classes.js', `export default ${JSON.stringify(result, null, 4)}`)
}

function write_css(input) {
	write_file('raw.css', input)
	return postcss([next])
		.process(input)
		.then(result => {
			write_file('legos.css', result.css)
			return postcss([nano]).process(result.css)
		})
		.then(result => {
			write_file('legos.min.css', result.css)
		})
}

function write_file(name, data) {
	fs.writeFileSync(path.join(OUTPUT_DIR, name), data)
}

function clean() {
	try { fs.rmdirSync(OUTPUT_DIR) } catch(e) {}
	try { fs.mkdirSync(OUTPUT_DIR) } catch(e) {}
}

function stream_rules(directory) {
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