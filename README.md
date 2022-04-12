# Circuit Breaker Example - Node.js

The Circuit Breaker Example demonstrates a generic pattern for reporting the
failure of a service and then limiting access to the failed service until it
becomes available to handle requests. This helps prevent cascading failure in
other services that depend on the failed services for functionality.

This example shows you how to implement a Circuit Breaker and Fallback pattern
in your services.

## Community vs. Fully Supported

By default,  this example will show how to use the community version of the [Opossum Circuit Breaker](https://www.npmjs.com/package/opossum)

To use the fully supported version of Opossum, there are a couple steps that should be completed.  Note: All the steps should be performed in the `greeting-service` sub-directory

1. Make sure there is a [`.npmrc`](./greeting-service/.npmrc) file in the root of the `greeting-service` directory.

2. Uninstall the community version first with `npm uninstall opossum` then install the fully supported version with this command: `npm install @redhat/opossum`

3. In the [app.js](./greeting-service/app.js) file:

```
/* Remove or comment out the line below */
const Opossum = require('opossum');

/* Uncomment the line below to use the fully Red Hat Supported version of Opossum */
// const Opossum = require('@redhat/opossum');
```
For more information on Red Hat's Node.js offerings, [click here](https://access.redhat.com/documentation/en-us/red_hat_build_of_node.js/)

## About Circuit Breaker

The Circuit Breaker is a pattern intended to mitigate the impact of network
failure and high latency on service architectures where services synchronously
invoke other services. In such cases, if one of the services becomes
unavailable due to network failure or incurs unusually high latency values due
to overwhelming traffic, other services attempting to call its endpoint may
end up exhausting critical resources in an attempt to reach it, rendering
themselves unusable. This condition is also known as cascading failure and can
render the entire microservice architecture unusable.

Essentially, the Circuit Breaker acts as a proxy between a protected function
and a remote function, which monitors for failures. Once the failures reach a
certain threshold, the circuit breaker trips, and all further calls to the
circuit breaker return with an error or a predefined fallback response,
without the protected call being made at all. The Circuit Breaker usually also
contains an error reporting mechanism that notifies you when the Circuit
Breaker trips.

## Why is Circuit Breaker Important

In an architecture where multiple services depend on each other for
functionality, a failure in one service can rapidly propagate to its dependent
services, causing the entire architecture to collapse. Implementing a Circuit
Breaker pattern helps prevent this. With the Circuit Breaker pattern
implemented, a service client invokes a remote service endpoint via a proxy at
regular intervals. If the calls to the remote service endpoint fail repeatedly
and consistently, the Circuit Breaker trips, making all calls to the service
fail immediately over a set timeout period and returns a predefined fallback
response. When the timeout period expires, a limited number of test calls are
allowed to pass through to the remote service to determine whether it has
healed, or remains unavailable. If these test calls fail, the Circuit Breaker
keeps the service unavailable and keeps returning the fallback responses to
incoming calls. If the test calls succeed, the Circuit Breaker closes, fully
enabling traffic to reach the remote service again.

## Design Tradeoffs

### Pros
* Enables a service to handle the failure of other services it invokes.

### Cons
* Optimizing the timeout values can be challenging
* Larger-than-necessary timeout values may generate excessive latency.
* Smaller-than-necessary timeout values may introduce false positives.

## Running The Example

You can run this example as node processes on your localhost or as pods on an Openshift Cluster.  [Code Ready Container](https://developers.redhat.com/products/codeready-containers/overview) can be used to try out Openshift locally.

### Localhost

To run the basic application on your local machine, just run the
`start-localhost.sh` script.

```
$ ./start-localhost.sh
```

This will launch the greeting service on port 8080 and the name
service on port 8081. To kill the servers, run `./shutdown-localhost.sh`.

### Code Ready Containers

The cluster should be started, and you should be logged in with a currently
active project. Then run the `./start-openshift.sh` script.

```sh
$ oc new-project circuit-breaker-example # Create a project to deploy to
$ ./start-openshift.sh # Launch the example app
```

## Further Reading
* [microservices.io: Microservice Patterns: Circuit Breaker](http://microservices.io/patterns/reliability/circuit-breaker.html)
* [Martin Fowler: CircuitBreaker](https://martinfowler.com/bliki/CircuitBreaker.html)

