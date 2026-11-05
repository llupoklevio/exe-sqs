#!/bin/sh

echo "Avvio del container"
exec node cli/dist/main.js "$@"