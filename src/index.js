const Fs = require('node:fs')
const Path = require('node:path')

const pkg = JSON.parse(Fs.readFileSync(Path.join(__dirname, '../package.json')))

const eslintUnsafe = require('eslint/use-at-your-own-risk')

const PLUGIN_NAME = 'no-autofix'

module.exports = (configs, rulesToNeuter) => {
	const findOriginalRule = (ruleName) => {
		const builtinRule = eslintUnsafe.builtinRules.get(ruleName)
		if (builtinRule) { return builtinRule }

		for (const config of configs) {
			if (!config.plugins) { continue }
			for (const [pluginName, plugin] of Object.entries(config.plugins)) {
				const pluginRule = plugin.rules[ruleName.slice(pluginName.length + 1)]
				if (pluginRule) { return pluginRule }
			}
		}

		return null
	}

	const ruleDefinitions = {}
	const ruleSettings = {}

	for (const [ruleName, settings] of Object.entries(rulesToNeuter)) {
		const originalRule = findOriginalRule(ruleName)

		ruleDefinitions[ruleName] = {
			meta: originalRule.meta,
			create: (context) => {
				const proxy = Object.create(context, {
					report: {
						value: (data) =>{
							delete data.fix
							return context.report(data)
						},
						writable: true,
						configurable: true,
					},
				})
				return originalRule.create(proxy)
			},
		}
		ruleSettings[`${PLUGIN_NAME}/${ruleName}`] = settings
		ruleSettings[ruleName] = 'off'
	}

	return {
		plugins: {
			[PLUGIN_NAME]: {
				meta: {
					name: pkg.name,
					version: pkg.version,
				},
				rules: ruleDefinitions,
			},
		},
		rules: ruleSettings,
	}
}
