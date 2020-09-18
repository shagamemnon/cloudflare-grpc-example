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
var CERT = process.env.CERT || '/etc/ssl/grpc/host-server.pem'
var KEY = process.env.KEY || '/etc/ssl/grpc/host-server-key.pem'
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

var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld

class Methods {
  static sayHello (call, callback) {
    callback(null, {message: 'Hello ' + call.request.name})
  }
  static sayHelloAgain (call, callback) {
    callback(null, {message: 'So we meet again ... ' + call.request.name})
  }
}



var credentials = {
  insecure: grpc.ServerCredentials.createInsecure(),
  secure: grpc.ServerCredentials.createSsl(null, [{
    private_key: Buffer.from(fs.readFileSync(KEY), 'ascii'),
    cert_chain: Buffer.from(fs.readFileSync(CERT), 'ascii')
  }], false)
};


(function main() {
  var server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, {
    sayHello: Methods.sayHello,
    sayHelloAgain: Methods.sayHelloAgain
  })

  server.bind(`127.0.0.1:${PORT}`, credentials.secure)
  server.start()
})()
