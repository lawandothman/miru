echo "Setting port config to $PORT"
rm /var/lib/neo4j/conf/neo4j.conf
echo "\nserver.bolt.listen_address=0.0.0.0:${PORT}" >> /var/lib/neo4j/conf/neo4j.conf
echo "\nserver.http.listen_address=0.0.0.0:7474" >> /var/lib/neo4j/conf/neo4j.conf

echo "Starting Neo4j with config"	
cat /var/lib/neo4j/conf/neo4j.conf

neo4j console