'use strict'
const fastify = require('fastify')
const app = fastify({
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty'
    }
  },
  disableRequestLogging: true,
  requestIdLogLabel: 'reqId',
  requestIdHeader: 'request-id',
  genReqId: function (httpIncomingMessage) {
    return `foo-${Math.random()}`
  }
})

/** 
    @Request 
    curl -H 'Content-Type: application/json' \
         -d '{ "title":"foo","body":"bar", "id": 1}' \
         -X POST \
         http://0.0.0.0:8080/xray?page=11&catefory=special
*/
app.route({
  url: '/xray',
  method: 'POST',
  handler: xRay
})
function xRay (request, reply) {
  // send back all the request properties
  return JSON.stringify({
    id: request.id, // id assigned to the request in req-<progress>
    ip: request.ip, // the client ip address
    ips: request.ips, // proxy ip addressed
    hostname: request.hostname, // the client hostname
    protocol: request.protocol, // the request protocol
    method: request.method, // the request HTTP method
    url: request.url, // the request URL
    routerPath: request.routerPath, // the generic handler URL
    is404: request.is404, // the request has been routed or not
    all: Object.keys(request),
    params: request.params,
    query: request.query,
    body: request.body,
    log: request.log,
  },null, 2)
}

app.get('/log', function log (request, reply) {
  request.log.info('hello') // [1]
  request.log.info('world')
  reply.log.info('late to the party') // same as request.log

  app.log.info('unrelated') // [2]
  reply.send()
})

app.listen({
  port: 8080,
  host: '0.0.0.0'
})
.then((address) => {
  // Server is now listening on ${address}
})
