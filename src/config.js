module.exports = {
  API_KEY: "hafNGT5kK76l11tjtq9Q18swzs7frVPG3NlUrZc3",
  API_URL: "ppriuj7e7i.execute-api.us-east-1.amazonaws.com",
  API_ENV: "/prod/",
  GET_AUTH_TOKEN_ENDPOINT: "SandboxGetAuthToken",
  SANDBOX_REDIRECT_URL: "https://neo4j.com/sandbox-v2/graphql?action=graphql-run&auth_token=",
  SANDBOX_GET_INFO_ENDPOINT : "SandboxGetAuthTokenInfo/?token=",
  BASE_GRAPHIQL_URL: "https://neo4j-graphql.github.io/graphiql4all/index.html",
  DEFAULT_SCHEMA_FILENAME: "movieSchema.graphql",
  DEFAULT_SCHEMA: `type User {
    id: Int
    name: String!
    movies: [Movie] @relation(name: "RATED", direction: "out")
  }

  type Movie {
    id: Int
    title: String!
    year: Int
    plot: String
    poster: String
    imdbRating: Float
    genres: [Genre] @relation(name: "IN_GENRE", direction: "out")
    actors: [Actor] @relation(name: "ACTED_IN", direction: "in")
    directors: [Director] @relation(name: "DIRECTED", direction: "in")
    similar: [Movie] @cypher(statement: "WITH {this} AS this MATCH (this)-[:IN_GENRE]->(:Genre)<-[:IN_GENRE]-(rec:Movie) WITH rec, COUNT(*) AS num ORDER BY num DESC RETURN rec LIMIT 10")
  }

  type Genre {
    id: Int
    name: String!
    movies: [Movie] @relation(name: "IN_GENRE", direction: "in")
  }

  type Director {
    id: Int
    name: String!
    movies: [Movie] @relation(name: "DIRECTED", direction: "out")
  }

  type Actor {
    id: Int
    name: String!
    movies: [Movie] @relation(name: "ACTED_IN", direction: "out")
  }`
}
