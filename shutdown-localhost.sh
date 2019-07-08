#!/bin/bash

kill `cat *.pid`
rm *.pid

echo "Stopped successfully."