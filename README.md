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

4. Install dependencies using bower
```
bower install
```

Running
-------

5. Install dependencies and start the server application

```
npm install -g nodemon &&\
npm install &&\
jsenv rehash &&\
GATEWAY_USERNAME=_username_ GATEWAY_PASSWORD=_password_ npm run-script debug
```

6. Start the client application

```
open "http://_your_ip_address_:8080
```
