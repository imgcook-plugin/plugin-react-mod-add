/**
 * @name plugin example
 * @param option: { data, filePath, config }
 * - data: module and generate code Data
 * - filePath: Pull file storage directory
 * - config: cli config
 */

const fse = require('fs-extra');
const ora = require('ora');
const spinner = ora();
const imageHandler = require('./imageHandler');

const pluginHandler = async options => {
  let data = await imageHandler(options);
  let { config, filePath } = data;
  const { value } = config;

  let result = {
    errorList: []
  };
  const panelDisplay = data.code.panelDisplay;
  // const defaultFilePath = filePath;
  
  try {
    filePath = `${filePath}/src/mods/mod${value}`;
    if (!fse.existsSync(`${filePath}`)) {
      fse.mkdirSync(`${filePath}`);
    }
  } catch (error) {
    result.errorList.push(error);
  }
  try {
    let index = 0;
    for (const item of panelDisplay) {
      let panelValue = item.panelValue;
      const { panelName } = item;
      let outputFilePath = `${filePath}/${panelName}`;
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
        outputFilePath = `${filePath}/${item.filePath}${panelName}`;
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
    console.log(error);
  }

  // Retrieve mods directory update index
  // try {
  //   let modList = [];
  //   let string = '';
  //   modList = fse.readdirSync(`${defaultFilePath}/src/mods/`).filter(v => {
  //     return v !== 'index.js';
  //   });
  //   modList.map(name => {
  //     string += `import ${name} from './${name}'\n`;
  //   });
  //   string += 'export default {\n';
  //   modList.map(name => {
  //     string += `\t${name},\n`;
  //   });
  //   string += '}';
  //   fse.writeFileSync(`${defaultFilePath}/src/mods/index.js`, string, 'utf-8');
  //   setTimeout(() => {
  //     spinner.succeed(` 索引文件 index.js 更新完成`);
  //   }, 0);
  // } catch (error) {
  //   result.errorList.push(error);
  // }
  // console.log({ data, filePath, config, result });
  return { ...data, filePath, config, result };
};

module.exports = (...args) => {
  return pluginHandler(...args).catch(err => {
    console.log(err);
  });
};
