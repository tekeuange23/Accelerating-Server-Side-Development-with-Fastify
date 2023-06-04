'use strict'
const fastify = require('fastify')
const fs = require('fs/promises')
const util = require('util')
const serverOptions = { logger: true }
const app = fastify(serverOptions)

/* FULLY DECLARATION */
app.route({
  url: '/hello-world',
  method: 'GET',
  handler: handlerFunction
})

/* SHORTHAND DECLARATIONS */
app.get('/shorthand/handler', handlerFunction) // [1]
app.get('/shorthand/options', { handler: handlerFunction }) // [2]
app.get('/shorthand/mixed', {}, handlerFunction) // [3]

function handlerFunction (request, reply) {
  reply.send('world')
}

/* NAMED FUNCTION */
function business (request, reply) {
  // `this` is the Fastify application instance
  return { helloFrom: this.server.address() }
}

app.get('/server', business)
app.get('/thisapp', function app_vs_this (request, reply) {
  return {test: util.isDeepStrictEqual(this, app)}
})

/* ARROW FUNCTION */
app.get('/fail', (request, reply) => {
  // `this` is undefined because of arrow function
  reply.send({ helloFrom: this.server.address() })
})

/* MULTIPLE FULFILLMENT */
app.get('/multi', function multi (request, reply) {
  reply.send('one')
  reply.send('two')
  reply.send('three')
  this.log.info('this line is executed')
})

/* ASYNC HANDLER */
app.get('/hello', async function myHandler (request, reply) {
  return 'hello' // simple returns of a payload
})

/* ASYNC HANDLER RE-USE */
async function foo (request, reply) {
  return { one: 1 }
}
async function bar (request, reply) {
  const oneResponse = await foo(request, reply)
  return {
    one: oneResponse,
    two: 2
  }
}
app.get('/foo', foo)
app.get('/bar', bar)

/* SYNC HANDLER RETURNS A PROMISE */
app.get('/file', function promiseHandler (request, reply) {
  const fileName = './package.json'
  const readPromise = fs.readFile(fileName, { encoding: 'utf8' })
  console.log(readPromise)
  return readPromise
})

app.get('/file2', async function promiseHandler (request, reply) {
  const fileName = './package.json'
  const readPromise = await fs.readFile(fileName, { encoding: 'utf8' })
  console.log(readPromise)
  return 'read File!'
})

app.listen({
  port: 8080,
  host: '0.0.0.0'
}).then((address) => {
  // Server is now listening on ${}address
})
