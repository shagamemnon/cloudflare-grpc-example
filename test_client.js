/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var PROTO_PATH = __dirname + '/protos/helloworld.proto';
var PORT = process.env.PORT || 10443
var HOST = process.env.HOST || '127.0.0.1'
var INTERMEDIATE_CA = process.env.INTERMEDIATE_CA || '/etc/ssl/grpc/intermediate_ca.pem'
var fs = require('fs')

var grpc = require('grpc')
var protoLoader = require('@grpc/proto-loader')
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
})
var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

(function() {
  var TLS
  var creds = {
    secure: grpc.credentials.createSsl(Buffer.from(fs.readFileSync(INTERMEDIATE_CA, 'ascii'))),
    insecure: grpc.credentials.createInsecure()
  }
  if (process.env.TLS && process.env.TLS === 'on') {
    TLS = creds.secure
  } else {
    TLS = creds.insecure
  }
  var client = new hello_proto.Greeter(`${HOST}:${PORT}`, TLS)
  var user = process.argv.length >= 3 ? user = process.argv[2] : user = 'world'

  client.sayHello({name: user}, (err, response) => {
    if (err) return console.log(err.details)
    return console.log('Greeting:', response.message)
  })
})()