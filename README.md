Experiments with Avro and Confluent.

### Avro IDL

.avsc Avro schema files are generated from the Avro .idl files.  More on Avro IDL here:
https://avro.apache.org/docs/1.7.7/idl.html

This seems to be a better way to maintain Avro schemas, as the syntax is more concise,
and you can import and reuse your defined records more easily.

To generate the schmea files, download http://www.gtlib.gatech.edu/pub/apache/avro/avro-1.7.7/java/avro-tools-1.7.7.jar
and then

```
java -jar ./avro-tools-1.7.7.jar idl2schemata avro/idl/EditEvent.idl avro/schema
````

Schema .avsc and also .java class generation would usually be automated by Maven plugins.

## Confluent Schema Registry
### POSTing an Avro schema file to Confluent Schema Registry:
```bash
curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data "{\"schema\": $(./avro_stringify.js ./avro/schema/EditEvent.avsc) }" \
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

# Show just the .avsc JSON schema
curl -X GET http://localhost:8081/schemas/ids/$unique_schema_id | jq .schema | ./json_unstringify.sh
```

## Confluent Kafka REST Proxy

### Producing a message

```bash
curl -X POST -H "Content-Type: application/vnd.kafka.avro.v1+json" \
    --data "{\"value_schema_id\": 1, \"records\":
        [
            {\"value\": $(cat ./EditEventRecord.json)}
        ]
    }" \
    "http://localhost:8082/topics/EditEvent"

```

### Consuming messages

You must create a consumer group and instance(s) in the conumser group and
register it with the REST proxy in order to consume messages.  Many instances
can belong to a single consumer group, and messages are balanced between
multiple instances in a given consumer group (I think).

```bash
# Create an instance in a new consumer group
curl -X POST -H "Content-Type: application/vnd.kafka.v1+json" \
      --data '{"id": "my_avro_consumer_instance_1", "format": "avro", "auto.offset.reset": "smallest"}' \
      http://localhost:8082/consumers/my_avro_consumer
# This returns an object with the consumer instance base URI:
# {"instance_id":"my_avro_consumer_instance_1","base_uri":"http://localhost:8082/consumers/my_avro_consumer/instances/my_avro_consumer_instance_1"}

# now start consuming messages with this consumer instance
curl -X GET -H "Accept: application/vnd.kafka.avro.v1+json" \
      http://localhost:8082/consumers/my_avro_consumer/instances/my_avro_consumer_instance_1/topics/EditEvent | jq .

