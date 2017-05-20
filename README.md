# Neo4j GraphQL CLI

Deploy Neo4j backed GraphQL APIs based on your custom GraphQL schema.

**What does it do?**

*Allows you to deploys a Neo4j GraphQL instance on Neo4j Sandbox. This Neo4j GraphQL instance will serve a GraphQL endpoint based on a GraphQL schema that you define.*

## Steps

1. Define your GraphQL schema using GraphQL schema syntax, *myschema.graphql*
1. `./bin/neo4j-graphql myschema.graphql`
1. When prompted sign into Neo4j Sandbox.
1. You'll be presented with the credentials for your GraphQL instance, including a Graphiql URL

## Schema First Development

TODO. Overview of schema first development and example schema

## Example

TODO. Schema example, demonstrate Graphiql and queries

# Features

- [x] deploy Neo4j GraphQL Sandbox instance
- [x] support user defined GraphQL schema
- [x] support @cypher GraphQL schema directives
- [ ] support self-hosted Neo4j instances
- [ ] support schema updates