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
  name: ID!
  seen: [Movie] @relation(name: "RATED")
  recommended(first:Int = 5): [Movie] @cypher(statement:"WITH $this as u MATCH (u)-->(:Movie)<--(:User)-->(reco:Movie) WHERE NOT (u)-[:RATED]->(reco) RETURN reco, count(*) as score ORDER BY score DESC LIMIT $first") 
}
enum Genre {
  SciFi, Drama, Horror, Family, Comedy
}
type Movie {
  title: ID!
  year: Int
  plot: String
  imdbRating: Float
  poster: String
  genre: [Genre]
  actors: [Actor] @relation(name: "ACTED_IN", direction: "in")
  directors: [Director] @relation(name: "DIRECTED", direction: "in")
  similar(first:Int=5): [Movie] @cypher(statement: 
      "WITH $this AS this MATCH (this)<-[:DIRECTED|ACTED_IN]-(:Person)-[:DIRECTED|ACTED_IN]->(sim:Movie) RETURN sim, COUNT(*) AS freq ORDER BY freq DESC LIMIT $first")
}
interface Person {
  name: ID!
  born: Int
  movies: [Movie]
}
type Director implements Person {
  name: ID!
  born: Int
  movies: [Movie] @relation(name: "DIRECTED")
}
type Actor implements Person {
  name: ID!
  born: Int
  movies: [Movie] @relation(name: "ACTED_IN")
  totalMovies:Int @cypher(statement: 
    "WITH $this as this RETURN size( (this)-[:ACTED_IN]->(:Movie) ) as total")
}
schema {
  mutation: MutationType
  query: QueryType
}
type QueryType {
  topRatedMovies(rating:Int): [Movie] @cypher(statement:
  "MATCH (m:Movie)<-[r:RATED]-(:User) WHERE r.score > $score RETURN m, avg(r.rating) as score ORDER BY score DESC LIMIT 10")
  moviesByName(substring:String, first: Int): [Movie] @cypher(statement:
  "MATCH (m:Movie) WHERE toLower(m.title) CONTAINS toLower($substring) RETURN m LIMIT $first")
}
type MutationType {
  rateMovie(user:ID!,movie:ID!,score:Float=5) : String
  @cypher(statement:"MATCH (u:User {name:$user}), (m:Movie {title:$movie}) MERGE (u)-[r:RATED]->(m) SET r.score = $score")
}`
}
