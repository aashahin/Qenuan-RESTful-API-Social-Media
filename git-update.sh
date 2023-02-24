#!/bin/bash

#Add
git add .
#Commit
echo "Entre Commit: "
read commit
git commit -m "$commit"
#Push
git push origin -u main
