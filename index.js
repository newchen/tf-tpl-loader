let fs = require("fs");
let path = require("path");

let _ = require("lodash");
let loaderUtils = require("loader-utils");

// 缓存
let viewCache = {};

// 增加子模板支持
function preComplie(source, rootPath, relativePath) {
    let replaced = function(source, rootPath, relativePath) {
        // 去掉html的注释内容, 因为里面可能有模板字段逻辑, 那么下面template方法就会报错
        source = source.replace(/<!--[\w\W]*-->/gm, "");

        return source.replace(/<%\s*(include.+)\s*%>/g, function(match, code) {
            let part = code.split(/\s/)[1];
            let char = part.charAt(0);
            let basicPath = relativePath;

            if (char === "/") {
                // 根路径
                basicPath = rootPath;
            } else if (char === "." || char === "..") {
                // 相对路径
                basicPath = relativePath;
            } else {
                // 直接就是文件名
                part = "../" + part;
            }

            let filePath = path.join(basicPath, part);

            if (!viewCache[filePath]) {
                if (!fs.existsSync(filePath)) {
                    console.log(
                        `\x1B[31m 模板路径: ${filePath}不存在 \x1B[39m`
                    );
                } else {
                    viewCache[filePath] = fs.readFileSync(filePath, "utf-8");
                }
            }

            if (viewCache[filePath]) {
                // 多层嵌套, 继续替换
                if (viewCache[filePath].match(/<%\s*(include.+)\s*%>/)) {
                    return replaced(viewCache[filePath], rootPath, filePath);
                } else {
                    return viewCache[filePath];
                }
            }

            return `<div style="color: red;">${code}</div>`;
        });
    };

    return replaced(source, rootPath, relativePath);
}

// function getLoaderConfig(context) {
// 	var query = loaderUtils.getOptions(context) || {};
// 	var configKey = query.config || 'tplLoader';
// 	var config = context.options && context.options.hasOwnProperty(configKey) ? context.options[configKey] : {};

// 	delete query.config;

// 	return _.extend({}, query, config);
// }

module.exports = function(source) {
    viewCache = {}; // 清缓存

    this.cacheable && this.cacheable();

    // 普通的html
    if (source.indexOf("<%") === -1 || source.indexOf("%>") === -1) {
        return source;
    }

    // Handle filenames (#106)
    let webpackRemainingChain = loaderUtils
        .getRemainingRequest(this)
        .split("!");

    let filename = webpackRemainingChain[webpackRemainingChain.length - 1];

    // let config = getLoaderConfig(this);
    let query = loaderUtils.parseQuery(this.query);
    let options = this.options.tplLoader || {};
    let config = _.extend({}, query, options);

    // 支持include语法
    let rootPath = config.rootPath
        ? path.join(process.cwd(), config.rootPath)
        : process.cwd();
    source = preComplie(source, rootPath, filename);

    ["escape", "interpolate", "evaluate"].forEach(function(templateSetting) {
        let setting = config[templateSetting];
        if (_.isString(setting)) {
            config[templateSetting] = new RegExp(setting, "g");
        }
    });

    let template = _.template(source, config);
    let exportsString = "module.exports = ";

    if (config.export === "es6") {
        exportsString = "export default ";
    } else if (config.export === "return") {
        exportsString = "return ";
    } else if (config.export === "") {
        exportsString = "";
    }

    return exportsString + template;
};
