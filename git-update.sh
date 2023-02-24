#!/bin/bash

#Add
git add .
#Commit
read commit
echo $commit
git commit -m "$commit"
#Push
git push origin -u main
