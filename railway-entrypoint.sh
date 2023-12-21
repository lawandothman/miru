echo "Setting port config to $PORT"
echo "\nserver.bolt.listen_address=:${PORT}" >> /var/lib/neo4j/conf/neo4j.conf

echo "Starting Neo4j with config"	
cat /var/lib/neo4j/conf/neo4j.conf

neo4j console