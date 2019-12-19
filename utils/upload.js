const fs = require('fs');
const request = require('request');

class upload {
  constructor(option) {
    this.option = option;
    this.uploadUrl = '';
  }

  start(file, option, callback) {
    let stream = null;
    if (typeof file === 'string') {
      stream = fs.createReadStream(file);
    } else if (file instanceof Stream) {
      stream = file;
    } else {
      throw TypeError(
        'Only incoming file paths or stream instances are supported.'
      );
    }

    const paths = stream.path.split('/');
    const originFileName = paths[paths.length - 1];
    const uploadUrl = this.uploadUrl;

    // Create promise
    let resolveCallback, rejectCallback;
    const promise = new Promise((resolve, reject) => {
      resolveCallback = resolve;
      rejectCallback = reject;
    });
    if (!callback) {
      callback = (err, body) => {
        if (err) {
          rejectCallback(err);
        } else {
          resolveCallback(body);
        }
      };
    }

    request.post(
      {
        url: uploadUrl,
        json: true,
        formData: {
          filepath: option.filepath ? option.filepath : '',
          custom_file: {
            value: stream,
            options: {
              filename: originFileName
            }
          }
        }
      },
      (err, httpResponse, body) => {
        typeof callback === 'function' && callback(err, body);
      }
    );

    return promise;
  }
}

module.exports = upload;
