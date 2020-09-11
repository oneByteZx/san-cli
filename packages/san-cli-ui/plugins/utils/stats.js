/**
 * @file 对cli-plugin-dashboard返回的数据进行格式化
 * From https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/ui-defaults/utils/stats.js
 * Modified by jinzhan
 */
const ModulesUtils = require('./modules');

const sizeTypes = ['stats', 'parsed', 'gzip'];

exports.processStats = function (stats) {
    const rawModules = ModulesUtils.filterModules(stats.data.modules);

    const modulesPerSizeType = {};
    const analyzer = {};
    for (const sizeType of sizeTypes) {
        const modules = ModulesUtils.buildSortedModules(rawModules, sizeType);
        const modulesTotalSize = modules.reduce((total, module) => total + module.size, 0);
        const depModules = ModulesUtils.buildDepModules(modules);
        const depModulesTotalSize = depModules.reduce((total, module) => total + module.size, 0);
        modulesPerSizeType[sizeType] = {
            modulesTotalSize,
            depModules,
            depModulesTotalSize
        };

        const modulesTrees = ModulesUtils.buildModulesTrees(rawModules, sizeType);
        analyzer[sizeType] = {
            modulesTrees
        };
    }

    stats = {
        data: {
            errors: stats.data.errors,
            warnings: stats.data.warnings,
            assets: stats.data.assets.map(a => ({
                name: a.name,
                size: a.size
            })),
            chunks: stats.data.chunks.map(c => ({
                id: c.id,
                names: c.names
            }))
        },
        computed: {
            modulesPerSizeType
        },
        sizeTypes
    };

    return {
        stats,
        analyzer
    };
};
