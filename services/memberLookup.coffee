request = require 'request'
zlib = require 'zlib'


lookup = (type, id, callback) ->
  req = request.post 'http://tribunal.uc.edu/attendance/ajax/lookup', {form:{type:type, id: id}, headers: {'X-Requested-With': 'XMLHttpRequest', 'Accept-Encoding': 'gzip'}, encoding: null}

  req.on 'response', (res) ->
    chunks = [];
    res.on 'data', (chunk) ->
      chunks.push (chunk)

    res.on 'end', () ->
      buffer = Buffer.concat(chunks);
      zlib.gunzip buffer, (err, decoded) ->
        data = JSON.parse(decoded.toString());
        err = err || data.err
        callback err, data

exports.lookupByIso = (iso, callback) ->
  lookup 'iso', iso, callback

exports.lookupByUcid = (ucid, callback) ->
  lookup 'ucid', ucid, callback



