#!/bin/bash

#Add
git add .
#Commit
echo "Entre Commit: "
read commit
git commit -m "$commit"
#Push
git push origin -u main $0="aashahin" $1="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"
