var Ajv = require('ajv');
var file = require('file')
var JsonRefs = require('json-refs')
var sprintf = require('sprintf-js').sprintf
var Promise = require("native-promise-only");
var ajv = Ajv();

var pathSeparator = require('path').sep


var schemaRoot = './jsonschema'


function isJsonFile(filename) {
    return filename.indexOf('.json') > 0;
}


function schemaTitleToPath(title) {
    return title.split('.').join(pathSeparator) + '.json';
}

//  TODO should we use schema.id???
//  ajv says:
//  https://github.com/epoberezkin/ajv#addschemaarrayobjectobject-schema--string-key
//  "Key can be passed that can be used to reference the schema and will
//   used as the schema id if there is no id inside the schema. If the key is
//   not passed, the schema id will be used as the key.""
//
function loadSchemaByTitle(title) {
    return loadSchemaFromFile(schemaRoot + pathSeparator + schemaTitleToPath(title));
}

// title param is optional
function loadSchemaFromFile(filename) {
    var schema = require('./' + filename);
    if (!('title' in schema)) {
        console.log(sprintf("%30s: FAILED: 'title' must be set.", filename));
    }
    else if (typeof title != 'undefined' && title != schema.title) {
        console.log(sprintf("%30s: FAILED: %s does not match expected title %s",
            filename, schema.title, title));
    }
    else {
        // resolve $refs in this schema
        JsonRefs.resolveRefs(schema).then(function(result) {
            //TODO error checking of result.metadata???
            console.log(sprintf("%30s REGISTERED %s", filename, schema.title));
            console.log
            ajv.addSchema(result.resolved, schema.title);
            return result.resolved;
        });
    }
}



// Returns an Ajv instance with all schemas added to it
function loadSchemas(filepath) {
    console.log("Loading all JSON Schemas in path " + filepath + "...")
    // File all .json files
    file.walk(filepath, function(x, dirPath, dirs, files) {
        files
        .filter(isJsonFile) // use only .json files
        .map(loadSchemaFromFile) // require the file and addSchema
    })
}


function fillDefaults(schema, field, data) {
    var default_value = schema.properties[field].default
    if (default_value) {
        console.log("Setting missing field " + field + " value to default " + default_value)
        data[field] = default_value
    }
    return data
}



function validateAndFillDefaults(schemaTitle, record) {

    var isValid = ajv.validate(schemaTitle, record);
    if (!isValid) {
        console.log("Failed validation against " + schemaTitle +
            ", attempting to fill required defaults");

        // Filter for required field errors
        ajv.errors.filter(function(e) {
            return e.keyword == 'required'
        // Map to each missing required field name
        }).map(function(e) {
            return e.dataPath.substring(1);
        // For each missing required field name,
        // set it to the default value if it has a default.
        }).forEach(function(missingField) {
            record = fillDefaults(ajv.getSchema(schemaTitle).schema, missingField, record)
        });

        isValid = ajv.validate(schemaTitle, record);
    }

    if (!isValid) {
        console.error("Failed validation against " + schemaTitle + ": ", ajv.errors)
        return false
    }
    else {
        return record
    }
}


loadSchemas(schemaRoot);


function validateSimpleRecordTest(error, stdout, stderr) {
    var simpleRecord = { "name": "hi" }
    console.log(validateAndFillDefaults('org.mediawiki.test.Simple', simpleRecord))
}
var sys = require('sys')
var exec = require('child_process').exec;

// THIS IS BAD, I KNOW, but I just want to
// make sure all schemas are loaded before I try to validate one.
exec('sleep 1', validateSimpleRecordTest);



