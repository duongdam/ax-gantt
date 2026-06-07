import { onwarn as mendixOnwarn } from "@mendix/pluggable-widgets-tools/configs/shared.mjs";

const DHTMLX_GANTT_PATTERN = /node_modules[/\\]dhtmlx-gantt/;
const SUPPRESSED_WARNING_CODES = new Set(["THIS_IS_UNDEFINED"]);

function createOnwarn(args) {
    const baseOnwarn = mendixOnwarn(args);

    return (warning, warn) => {
        if (SUPPRESSED_WARNING_CODES.has(warning.code)) {
            return;
        }

        return baseOnwarn(warning, warn);
    };
}

function skipDhtmlxBabelTransform(plugin) {
    if (plugin?.name !== "babel" || typeof plugin.transform !== "function") {
        return plugin;
    }

    const transform = plugin.transform.bind(plugin);

    return {
        ...plugin,
        transform(code, id) {
            if (DHTMLX_GANTT_PATTERN.test(id)) {
                return null;
            }

            return transform(code, id);
        }
    };
}

export default args => {
    return args.configDefaultConfig.map(config => ({
        ...config,
        onwarn: createOnwarn(args),
        plugins: (config.plugins ?? []).map(skipDhtmlxBabelTransform)
    }));
};
