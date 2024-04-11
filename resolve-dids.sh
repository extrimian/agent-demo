#!/bin/bash
# quarkIdEndpoint=https://node-ssi.buenosaires.gob.ar
quarkIdEndpoint=https://demo.extrimian.com/sidetree-proxy
cat ./data/*-agent-storage.json | jq -r '.["operational-did"]' | while read -r line; do
    echo "Processing DID: $line"
    # curl "${quarkIdEndpoint}/resolve/$line" | jq 
    curl "${quarkIdEndpoint}/resolve/$line" | jq
done
