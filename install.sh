#!/bin/sh
npm install -g yo
npm install -g forever
npm install -g nodemon
jsenv rehash
npm install
mkdir -p /etc/init.d
cp ./etc/init.d/inalacourt /etc/init.d/.
cwd=$(pwd)
sed -i -e "s/__directory__/${cwd//\//\\/}/g" /etc/init.d/inalacourt
sed -i -e "s/__username__/$1/g" /etc/init.d/inalacourt
sed -i -e "s/__password__/$2/g" /etc/init.d/inalacourt
sed -i -e "s/__application__/$3/g" /etc/init.d/inalacourt
#rm -rf /etc/init.d/inalacourt-e
#sudo chmod 755 /etc/init.d/inalacourt
#sudo chown root:root /etc/init.d/inalacourt
#sudo update-rc.d inalacourt defaults
#sudo update-rc.d inalacourt enable

