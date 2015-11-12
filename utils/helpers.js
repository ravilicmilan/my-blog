var methods = {
	stripScriptTags: stripScriptTags
};

function stripScriptTags(text) {
	return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '***');
}

module.exports = methods;