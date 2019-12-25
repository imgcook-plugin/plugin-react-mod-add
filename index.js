/**
 * @name plugin example
 * @param option: { data, filePath, config }
 * - data: module and generate code Data
 * - filePath: Pull file storage directory
 * - config: cli config
 */

const fse = require('fs-extra');
const imageHandler = require('./imageHandler');

const pluginHandler = async options => {
  let data = await imageHandler(options);
  let { config, filePath } = data;
  const { value } = config;
  let result = {
    errorList: []
  };
  const panelDisplay = data.code.panelDisplay;
  let modFilePath = filePath;
  try {
    modFilePath = `${filePath}/src/mods/mod${value ||
      (data.moduleData && data.moduleData.id)}`;
    if (!fse.existsSync(`${modFilePath}`)) {
      fse.mkdirSync(`${modFilePath}`);
    }
  } catch (error) {
    result.errorList.push(error);
  }
  try {
    let index = 0;
    for (const item of panelDisplay) {
      let panelValue = item.panelValue;
      const { panelName } = item;
      let outputFilePath = `${modFilePath}/${panelName}`;
      if (item && item.filePath) {
        let str = item.filePath;
        if (typeof str === 'string') {
          str =
            str.substring(str.length - 1) == '/'
              ? str.substring(0, str.length - 1)
              : str;
        }
        const strArr = str.split('/');
        let folder = `${option.filePath}`;
        for (const strItem of strArr) {
          folder = `${folder}/${strItem}`;
          if (!fse.existsSync(folder)) {
            fse.mkdirSync(folder);
          }
        }
        outputFilePath = `${modFilePath}/${item.filePath}${panelName}`;
      }

      // Depend on merge processing for package
      try {
        if (panelName === 'package.json') {
          const packagePath = `${filePath}/package.json`;
          const newPackage = JSON.parse(panelValue) || null;
          if (newPackage && fse.existsSync(packagePath)) {
            let packageJson = await fse.readJson(packagePath);
            if (!packageJson.dependencies) {
              packageJson.dependencies = {};
            }
            const newDependencies = Object.assign(
              newPackage,
              packageJson.dependencies
            );
            packageJson.dependencies = newDependencies;
            panelValue = JSON.stringify(packageJson, null, 2);
          }
        }
      } catch (error) {
        result.errorList.push(error);
      } finally {
      }
      await fse.writeFile(outputFilePath, panelValue, 'utf8');
      index++;
    }
  } catch (error) {
    result.errorList.push(error);
  }

  return { data, filePath, config, result };
};

module.exports = (...args) => {
  return pluginHandler(...args).catch(err => {
    console.log(err);
  });
};
