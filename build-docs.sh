#!/bin/sh

OUTPUT=doc/naturaldocs-html
PROJECT=doc/naturaldocs-project

mkdir -p "$OUTPUT"
mkdir -p "$PROJECT"
NaturalDocs -i src -o HTML "$OUTPUT" -p "$PROJECT"
