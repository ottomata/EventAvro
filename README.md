Experiments with Avro and Confluent.

### Avro IDL

.avsc Avro schema files are generated from the Avro .idl files.  More on Avro IDL here:
https://avro.apache.org/docs/1.7.7/idl.html#imports

This seems to be a better way to maintain Avro schemas, as the syntax is more concise,
and you can import and reuse your defined records more easily.

To generate the schmea files, download http://www.gtlib.gatech.edu/pub/apache/avro/avro-1.7.7/java/avro-tools-1.7.7.jar
and then

```
java -jar ./avro-tools-1.7.7.jar idl2schemata EditEvent.idl schemas
````

Schema .avsc and also .java class generation would usually be automated by Maven plugins.

