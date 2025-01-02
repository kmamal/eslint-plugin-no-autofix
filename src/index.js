const eslint = require('eslint')
const ruleComposer = require('eslint-rule-composer')

const makeNeuteredRule = (rule) => ruleComposer
	.mapReports(rule, (problem) => ({ ...problem, fix: null }))

const init = (plugins) => {
	const rules = {}

	const builtinRules = new eslint.Linter().getRules()
	for (const [ ruleName, rule ] of builtinRules.entries()) {
		rules[ruleName] = makeNeuteredRule(rule)
	}

	for (const [ pluginName, plugin ] of Object.entries(plugins)) {
		for (const [ ruleName, rule ] of Object.entries(plugin.rules)) {
			rules[`${pluginName}/${ruleName}`] = makeNeuteredRule(rule)
		}
	}

	return {
		plugins: { 'no-autofix': { rules } },
		rules: {},
	}
}

module.exports = { init }
