var async   = require('async'),
    https   = require('follow-redirects').https,
    http    = require('http'),
    fs      = require('fs'),
    strings  = require('./strings'),
    config  = require('./config'),
    chalk   = require('chalk'),
    helpers = require('./helpers'),
    opn     = require('opn');

// Chalk styles

var chalkHighlightURL = chalk.bgBlue.bold.underline,
    chalkBanner       = chalk.bgBlue.green,
    chalkURL          = chalk.inverse;

function presentBanner(callback) {
  console.log(chalkBanner(strings.banner));
  console.log(chalk.blue(strings.boxTopText));
  console.log(strings.introText);
  return callback(null);
}

function getAuthToken(callback) {
  console.log("Requesting token....");

  var options = {
    headers: {
      'x-api-key': config.API_KEY
    },
    host: config.API_URL,
    path: config.API_ENV + config.GET_AUTH_TOKEN_ENDPOINT,
    method: 'POST'
  }
  
  var req = https.request(options, (res) => {

    res.on('data', (d) => {
      var obj = JSON.parse(d);
      if (obj.status && obj.token) {
        callback(null, obj.token)
      } else {
        callback("Error, no auth token received");
      }
    });

  }).on('error', (e) => {
    callback(e);
  })

  req.write('{}');
  req.end();


}

function redirectUser(token, callback) {

  console.log("Token retrieved...");
  console.log(strings.redirectForSandboxText);
  console.log(strings.boxTopText)
  console.log(chalkURL(config.SANDBOX_REDIRECT_URL + token));
  console.log(strings.boxTopText);
  console.log(strings.sandboxExplainerText);
  
  opn(config.SANDBOX_REDIRECT_URL + token);

  callback(null, token);
}




function pollSandboxInfo(token, callback) {
  // is passed token
  // polls SANDBOX_GET_INFO_ENDPOINT until 200
  // calls callback with dictionary of credential info
  
  process.stdout.write("Waiting for you to sign in...");

  var options = {
    headers: {
      'x-api-key': config.API_KEY
    },
    host: config.API_URL,
    path: config.API_ENV + config.SANDBOX_GET_INFO_ENDPOINT + token,
  }

  //console.log(options);

  async.doUntil(function(innerCallback) {
    https.get(options, (res) => {

      res.on('data', (d) => {
        var obj = JSON.parse(d);
        process.stdout.write(".");
        setTimeout(function() {innerCallback(null, obj)}, 5000) ;
      });

    }).on('error', (e) => {
      return callback(e);
    })
  },
  function(obj) {
    
    // FIXME: better check here
    if (obj instanceof Array) {
      return true;
    } else {
      return false;
    }
  },
  function(error, creds) {

    if (creds instanceof Array) {
      console.log("Neo4j GraphQL sandbox created!");
      callback(error, creds[0]);
    } else {
      callback(error, creds);
    }
  }
  )
}

function presentInfoSuccess(creds, callback) {
  console.log("Your GraphQL endpoint is available here:")
  console.log(chalkURL("https://" + helpers.constructProxyIp(creds) + "/graphql/\n"));
  console.log("Be sure to set Basic Auth header in your requests:");
  console.log(chalk.bold("Authorization: Basic " + new Buffer("neo4j:" + creds.password).toString('base64')));
  console.log("\n");
  
  console.log("Explore your Neo4j GraphQL API in Graphiql here:")
  console.log(chalkURL(helpers.constructGraphiql(creds)));
  
  return callback(null, creds);
}

/* STEP 4 - post schema to https://$ip:$port/graphql/idl
*/

function postSchema(creds, callback) {
  
  var schemaFilename = process.argv[2],
      schema;
      
  if (!schemaFilename) {
    console.log("No schema specified, using default movieSchema.graphql");
    schema = config.DEFAULT_SCHEMA;
  } else {
    try {
      schema = fs.readFileSync(schemaFilename);
    } catch (e) {
      console.log(chalk.red.bold("Unable to read " + schemaFilename + " - falling back to default movieSchema.graphlql"));
      schema = config.DEFAULT_SCHEMA;
    }
  }

  var options = {
    headers: {
      'Authorization': "Basic " + new Buffer("neo4j:" + creds.password).toString('base64')
    },
    host: helpers.constructProxyIp(creds),
    path: '/graphql/idl',
    method: 'POST'
  }

  var req = https.request(options, (res) => {

    res.on('data', (chunk) => {
      // got some data
    });
    
    res.on('end', (d) => {
      //process.stdout.write(d);

      if (res.statusCode == 200) {
        return callback(null, creds)
      } else {
        return callback("Error, posting the schema IDL failed. Please ensure your schema format is valid.");
      }
      
    });

  }).on('error', (e) => {
    return callback(e);
  })

  req.write(schema);
  req.end();
}

function writeGraphqlConfig(creds, callback) {
  
  process.env['NEO4J_GRAPHQL_ENDPOINT'] = helpers.constructProxyIp(creds) + "/graphql/";
  process.env['NEO4J_GRAPHQL_TOKEN'] =  new Buffer("neo4j:" + creds.password).toString('base64');
  
  let graphqlConfig = {
    "schemaPath": process.argv[2] || config.DEFAULT_SCHEMA_FILENAME,    
    "extensions": {
      "endpoints": {
        "dev": { 
          "url": process.env['NEO4J_GRAPHQL_ENDPOINT'],
          "headers": {
            "Authorization": "Basic ${env:NEO4J_GRAPHQL_TOKEN}"
          }
        }
      }
    }
  };
  
  try {
    fs.writeFileSync(".graphqlconfig", JSON.stringify(graphqlConfig));
  } catch (e) {
    callback(e, creds);
  } 
  
  console.log("Writing config to .graphqlconfig....");
  // TODO: log environment variable export command given shell
  console.log("Note: .graphqlconfig references an environment variable for the authorization token.");
  console.log("Run this command to export NEO4J_GRAPHQ_TOKEN as an environment variable:");
  console.log("export NEO4J_GRAPHQL_TOKEN=" + process.env['NEO4J_GRAPHQL_TOKEN']);
  
  callback(null, creds);
}

// MAIN
async.waterfall([
  presentBanner,
  getAuthToken,
  redirectUser,
  pollSandboxInfo,
  presentInfoSuccess,
  writeGraphqlConfig,
  postSchema
], function (err, result) {
    if (err) {
      console.log("ERROR - exiting");
      console.log(err);
      process.exit(1);
    } else {
    if (result) {
      var name = result.name || "";
      console.log("\nThanks " + name + "! Please email " + chalk.underline("devrel@neo4j.com") + " with any questions or feedback.");
      process.exit(0);
    }
  }
});