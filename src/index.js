const eslint = require('eslint')
const ruleComposer = require('eslint-rule-composer')
const Fs = require('node:fs')
const { findUpSync } = require('@kmamal/find-up')

const pkg = JSON.parse(Fs.readFileSync(findUpSync('package.json'), 'utf8'))


const makeNeuteredRule = (rule) => ruleComposer
	.mapReports(rule, (problem) => ({ ...problem, fix: null }))

const init = (plugins) => {
	const neuteredRules = {}

	const builtinRules = new eslint.Linter({ configType: 'eslintrc' }).getRules()
	for (const [ ruleName, rule ] of builtinRules.entries()) {
		neuteredRules[ruleName] = makeNeuteredRule(rule)
	}

	for (const [ pluginName, plugin ] of Object.entries(plugins)) {
		for (const [ ruleName, rule ] of Object.entries(plugin.rules)) {
			neuteredRules[`${pluginName}/${ruleName}`] = makeNeuteredRule(rule)
		}
	}

	return {
		plugins: {
			'no-autofix': {
				meta: {
					name: pkg.name,
					version: pkg.version,
				},
				rules: neuteredRules,
				configs: {},
				processors: {}
			}
		}
	}
}

module.exports = { init }
