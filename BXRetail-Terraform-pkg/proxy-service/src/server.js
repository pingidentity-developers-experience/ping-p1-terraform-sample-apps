/**
The Fastify proxy host for proxy-ing sensitive Management API calls.
NOT CURRENTLY IN USE, but will be used in future use cases.
*/

import Fastify from 'fastify'

const fastify = Fastify({
    logger: true
})

// Proxy calls to the PingOne Flows API
fastify.register(import('@fastify/http-proxy'), {
    //FIXME this upstream is a problem being hardcoded to the NA region. Ideally need to get local.pingone_domain from Terraform.
    upstream: 'https://auth.pingone.com/',
    prefix: '/auth', // optional
    http2: false // optional
})

//Proxy calls to the PingOne User API
fastify.register(import('@fastify/http-proxy'), {
    //FIXME this upstream is a problem being hardcoded to the NA region. Ideally need to get local.pingone_domain from Terraform.
    upstream: 'https://api.pingone.com/v1/environments',
    prefix: '/user', // optional
    http2: false // optional
})

fastify.register(import("@fastify/cors"), {
    origin: "*",
    methods: ["GET","POST","PATCH","PUT"]
})

// Run the server!
fastify.listen({ port: 4000, host: '0.0.0.0' }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    console.log("Server is now listening on "+address)
})