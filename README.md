NAFC Aircraft Tracking Demo
---------------------------

Tools

```
brew install https://raw.github.com/johnlayton/farmclose/master/jsenv.rb
```

```
brew install mr
```

Install dependencies and start the server application

```
npm install -g jake && jake && npm install -g nodemon && npm install && jsenv rehash && npm run-script debug
```

Start the client application

```
open "http://_your_ip_address_:8080/tracking?username=_your_gateway_username_&password=_your_gateway_password_
```

My leaflet mr config file

```
[Leaflet]
checkout = git clone 'https://github.com/Leaflet/Leaflet.git' 'Leaflet'

[Leaflet.ajax]
checkout = git clone 'https://github.com/calvinmetcalf/leaflet-ajax.git' 'Leaflet.ajax'

[Leaflet.draw]
checkout = git clone 'https://github.com/Leaflet/Leaflet.draw.git' 'Leaflet.draw'

[Leaflet.dvf]
checkout = git clone 'https://github.com/humangeo/leaflet-dvf.git' 'Leaflet.dvf'

[Leaflet.fullscreen]
checkout = git clone 'https://github.com/brunob/leaflet.fullscreen.git' 'Leaflet.fullscreen'

[Leaflet.label]
checkout = git clone 'https://github.com/Leaflet/Leaflet.label.git' 'Leaflet.label'

[Leaflet.hash]
checkout = git clone 'https://github.com/mlevans/leaflet-hash.git' 'Leaflet.hash'

[Leaflet.markercluster]
checkout = git clone 'https://github.com/Leaflet/Leaflet.markercluster.git' 'Leaflet.markercluster'

[Leaflet.search]
checkout = git clone 'https://github.com/stefanocudini/leaflet-search.git' 'Leaflet.search'
```
