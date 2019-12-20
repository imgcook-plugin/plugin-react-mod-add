const mockData = require('./mockData');
const fs = require('fs');
const expect = require('chai').expect;

describe('index.js', () => {
  const index = require('../index.js');
  const options = {
    data: mockData,
    filePath: './demo',
    config: {
      accessId: 'xx',
      dslId: 41,
      generator: ['@imgcook/generator-react'],
      plugin: [],
      uploadUrl: '',
      value: '17679'
    }
  };
  it('file path init', () => {
    const files = {
      src: `${options.filePath}/src`,
      public: `${options.filePath}/public`,
      mods: `${options.filePath}/src/mods`,
    }
    if (!fs.existsSync(options.filePath)) {
      fs.mkdirSync(options.filePath);
    }
    if (!fs.existsSync(files.src)) {
      fs.mkdirSync(files.src);
    }
    if (!fs.existsSync(files.public)) {
      fs.mkdirSync(files.public);
    }
    if (!fs.existsSync(files.mods)) {
      fs.mkdirSync(files.mods);
    }
  })

  it('index check param', async () =>{
    expect(options).to.be.an('object');
    expect(options.filePath).to.be.a('string');
  });
  it('index callback result', async () => {
    const { data } = await index(options);
    expect(data.code).to.be.an('object');
    expect(data.code.panelDisplay).to.be.an('array');
  });
});
