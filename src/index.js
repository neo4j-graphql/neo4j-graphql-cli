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
  console.log("https://" + helpers.constructProxyIp(creds) + "/graphql");
  console.log("Be sure to set Basic Auth header in your requests:");
  console.log("Authorization: Basic " + new Buffer("neo4j:" + creds.password).toString('base64'));
  
  console.log("Explore your Neo4j GraphQL API in Graphiql here:")
  console.log(helpers.constructGraphiql(creds));
  
  return callback(null, creds);
}

/* STEP 4 - post schema to https://$ip:$port/graphql/idl
*/

function postSchema(creds, callback) {
  // is passed dictionary of sandbox info
  // posts schema to /graphql/idl
  
  
  var schemaFilename = process.argv[2];
  if (!schemaFilename) {
    console.log("No schema specified, using default movieSchema.graphql");
    schemaFilename = config.DEFAULT_SCHEMA_FILENAME;
  }

  //console.log(schemaFilename);
  var schema = fs.readFileSync(schemaFilename, 'utf8')
  //console.log(schema);

  var options = {
    headers: {
      'Authorization': "Basic " + new Buffer("neo4j:" + creds.password).toString('base64')
    },
    host: helpers.constructProxyIp(creds),
    path: '/graphql/idl',
    method: 'POST'
  }

  var req = https.request(options, (res) => {

    res.on('end', (d) => {
      //process.stdout.write(d);

      if (res.statusCode == 200) {
        return callback(null, creds)
      } else {
        return callback("Error, posting the schema IDL failed");
      }
      
      process.exit();
    });

  }).on('error', (e) => {
    return callback(e);
  })

  req.write(schema);
  req.end();
}


// MAIN
async.waterfall([
  presentBanner,
  getAuthToken,
  redirectUser,
  pollSandboxInfo,
  presentInfoSuccess,
  postSchema
], function (err, result) {
  if (err) {
    console.log("ERROR - exiting");
    console.log(err);
  } else {
    console.log("SUCCESFULLY DEPLOYED NEO4J GRAPHQL WITH YOUR SCHEMA.")
    console.log(result);
  }
});
