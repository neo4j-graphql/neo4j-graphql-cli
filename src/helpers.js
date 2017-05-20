var config = require("./config");

/*
 * Builds the proxy ip from the private ip for the sandbox instance
 */
function constructProxyIp(creds) {
 var privip = creds['privip'],
     port   = creds['port'];

 var proxyIp = privip.replace(/\./gi, "-") + "-" + port.toString() + "." + "neo4jsandbox.com";
 return proxyIp;
}
 
function constructGraphiql(creds) {
 var graphqlEndpoint = "https://" + constructProxyIp(creds) + "/graphql/";
 var graphiqlURL = config.BASE_GRAPHIQL_URL + "?graphqlEndpoint=" + graphqlEndpoint + "&graphqlUser=neo4j" + "&graphqlPassword=" + creds.password;
   
 return graphiqlURL;
}

 module.exports = {
   constructProxyIp: constructProxyIp,
   constructGraphiql: constructGraphiql
 }
