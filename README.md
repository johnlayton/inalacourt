NAFC Aircraft Tracking Demo
---------------------------

Tools

```
brew install https://raw.github.com/johnlayton/farmclose/master/jsenv.rb
```

Checkout the leaflet projects

```
brew install mr
```

```
npm install -g jake && jake && npm install && jsenv rehash && npm run-script debug
```

Start the client application

```
open "http://_your_ip_address_:8080/tracking?username=_your_gateway_username_&password=_your_gateway_password_
```

My leaflet mr config file

```
[Leaflet]
checkout = git clone 'https://github.com/Leaflet/Leaflet.git' 'Leaflet'

[Leaflet.fullscreen]
checkout = git clone 'https://github.com/brunob/leaflet.fullscreen.git' 'Leaflet.fullscreen'

[Leaflet.hash]
checkout = git clone 'https://github.com/mlevans/leaflet-hash.git' 'Leaflet.hash'

[Leaflet.markercluster]
checkout = git clone 'https://github.com/Leaflet/Leaflet.markercluster.git' 'Leaflet.markercluster'

[Leaflet.search]
checkout = git clone 'https://github.com/stefanocudini/leaflet-search.git' 'Leaflet.search'
```

```
mr --config _path_to_mr_config_ update
```

Install dependencies and start the server application

```
npm install -g jake && \
  npm install -g nodemon &&\
  jake [LEAFLET_PATH=_path_to_leaflet_] [WAX_PATH=_path_to_wax_] && \
  npm install && \
  jsenv rehash && \
  npm run-script debug
```

Start the client application

```
open "http://_your_ip_address_:8080/tracking?username=_your_gateway_username_&password=_your_gateway_password_
```

My leaflet mr config file