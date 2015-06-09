Experiments with Avro and Confluent.

### Avro IDL

.avsc Avro schema files are generated from the Avro .idl files.  More on Avro IDL here:
https://avro.apache.org/docs/1.7.7/idl.html

This seems to be a better way to maintain Avro schemas, as the syntax is more concise,
and you can import and reuse your defined records more easily.

To generate the schmea files, download http://www.gtlib.gatech.edu/pub/apache/avro/avro-1.7.7/java/avro-tools-1.7.7.jar
and then

```
java -jar ./avro-tools-1.7.7.jar idl2schemata EditEvent.idl schemas
````

Schema .avsc and also .java class generation would usually be automated by Maven plugins.

## Confluent Schema Registry
### POSTing an Avro schema file to Confluent Schema Registry:
```bash
curl -X POST -i -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data "{\"schema\": $(./avro_stringify.js ./schemas/EditEvent.avsc) }" \
  http://localhost:8081/subjects/EditEvent/versions
```

### GETing an Avro schema out of the Confluent Schema Registry

```bash
unique_schema_id=1
schema_name=EditEvent
schema_version=1

# By unique schema ID:
curl -X GET http://localhost:8081/schemas/ids/$unique_schema_id

# By schema name and version
curl -X GET http://localhost:8081/subjects/$schema_name/versions/$schema_version

```
