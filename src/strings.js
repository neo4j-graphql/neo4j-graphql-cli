var banner = `
███╗   ██╗███████╗ ██████╗ ██╗  ██╗     ██╗     ██████╗ ██████╗  █████╗ ██████╗ ██╗  ██╗ ██████╗ ██╗     
████╗  ██║██╔════╝██╔═══██╗██║  ██║     ██║    ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██║  ██║██╔═══██╗██║     
██╔██╗ ██║█████╗  ██║   ██║███████║     ██║    ██║  ███╗██████╔╝███████║██████╔╝███████║██║   ██║██║     
██║╚██╗██║██╔══╝  ██║   ██║╚════██║██   ██║    ██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══██║██║▄▄ ██║██║     
██║ ╚████║███████╗╚██████╔╝     ██║╚█████╔╝    ╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║╚██████╔╝███████╗
╚═╝  ╚═══╝╚══════╝ ╚═════╝      ╚═╝ ╚════╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚══▀▀═╝ ╚══════╝
`
var introText = "Welcome to Neo4j-GraphQL. We will now deploy a Neo4j backed GraphQL API based on your custom defined schema";

var noSchemaText = "No schema specified. Using default movie schema.";

var redirectForSandboxText = "You may now sign in to Neo4j Sandbox to create a Neo4j GraphQL instance. Please visit this URL: ";

var sandboxExplainerText = "Once you sign into Neo4j Sandbox your Neo4j GraphQL instance will be deployed and a GraphQL endpoint will be created based on your schema";

var boxTopText = "********************************************************************************";

module.exports = {
  banner: banner,
  introText: introText,
  noSchemaText: noSchemaText,
  redirectForSandboxText: redirectForSandboxText,
  boxTopText: boxTopText,
  sandboxExplainerText: sandboxExplainerText
}
