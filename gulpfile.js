const uswds = require('@uswds/compile');

uswds.settings.version = 3;

exports.init = uswds.init;
exports.compile = uswds.compile;
exports.watch = uswds.watch;
