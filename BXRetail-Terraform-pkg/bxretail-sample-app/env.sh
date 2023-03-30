#!/bin/bash

# Creates a JS file with a JSON object made up of environment variables that
# are set to the global window object.
# 

if test -z "$1" ; then
  printf "\e[0;31mThis script requires an envFile argument."
  printf "\n%s" "Example:"
  printf "\n%s" "./env.sh .env.production\e[0m"
  printf "\n"
  exit 1
fi

ENVFILE=$1

# Recreate config file.
rm -rf ./env-config.js
touch ./env-config.js
# Start an object literal assigned to the global window object. 
echo "window._env_ = {" >> ./env-config.js

# Read each line in .env file
# Each line represents key=value pairs
while read -r line || test -n "${line}"
do
  #Only continue if the current line is not a comment "#".
  [[ ${line} =~ ^#.*  || -z "${line}" ]] && continue
  # Split env variables by character `=`
  if printf '%s\n' "${line}" | grep -q -e '='
  then
    varname=$(printf '%s\n' "${line}" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "${line}" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current environment variable if it exists.
  value=$(printf '%s\n' "${!varname}")
  # Otherwise use value from .env file
  test -z "${value}" && value=${varvalue}
  
  # Append configuration property to object literal.
  echo "  ${varname}: \"$value\"," >> ./env-config.js
done < "$ENVFILE"

# Close the object literal.
echo "}" >> ./env-config.js

# This script will self destruct
# If you are running this locally, comment this out.
# rm -- "$0"
