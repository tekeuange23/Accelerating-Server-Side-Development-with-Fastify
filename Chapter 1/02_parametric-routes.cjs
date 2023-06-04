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

const cats = []

app.get('/cats', function saveCat (request, reply) {
  return { allCats: cats }
})

app.post('/cats', function saveCat (request, reply) {
  cats.push(request.body)
  return { allCats: cats }
})

app.get('/cats/:catName', function readCat (request, reply) {
  const lookingFor = request.params.catName
  const result = cats.find(cat => cat.name === lookingFor)
  if (result) {
    reply.send({ cat: result })
  } else {
    reply.code(404)
    throw new Error(`cat ${lookingFor} not found`)
  }
})

// uncomment this to continue the chapter's example
app.get('/cats/:catIndex(\\d+)', function readCat (request, reply) {
  const lookingFor = request.params.catIndex
  const result = cats[lookingFor]
  return result ? { cat: result } : 'CAT NOT FOUND';
})

app.get('/cats/*', function sendCats (request, reply) {
  reply.send({ allCats: cats })
})

app.listen({
  port: 8080,
  host: '0.0.0.0'
})
.then((address) => {
  // Server is now listening on ${address}
})
