#!/bin/bash -eux

OUTPUT="$1"
RENAME_RULE="$2"

for file in "$OUTPUT"/*
do
    newfile="$(echo "$file" | sed -Ef "$RENAME_RULE")"
    if [ "$file" != "$newfile" ]
    then
        mv -f "$file" "$newfile"
    fi
done
