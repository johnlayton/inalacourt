NAFC Aircraft Tracking Demo
---------------------------

Setup
-----

1. Install jsenv (rbenv for node)
```
brew install https://raw.github.com/johnlayton/farmclose/master/jsenv.rb
```

2. Install node v0.10.18
```
jsenv install 0.10.18 && jsenv rehash
```

3. Install yeoman
```
npm install -g yo
```

4. Install forever
```
npm install -g forever
```

5. Install nodemon
```
npm install -g nodemon
```

6. Install dependencies using bower
```
bower install
```

Running
-------

7. Install dependencies and start the server application

```
npm install &&\
jsenv rehash &&\
GATEWAY_USERNAME=_username_ GATEWAY_PASSWORD=_password_ npm run-script debug
```

8. Start the client application

```
open "http://_your_ip_address_:8080
```

Installing
----------

8. Run install script

```
install.sh _username_ _password_
```