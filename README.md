NAFC Aircraft Tracking Demo
---------------------------

Setup
-----

1. Directory structure
~
└── Development
    ├── home
    |   └── analacourt
    └── public
        ├── leaflet
        |   ├── .mrconfig
        |   ├── Leaflet
        |   ├── Leaflet.search
        |   ├── Leaflet.fullscreen
        |   ├── Leaflet.ajax
        |   ├── Leaflet.hash
        |   └── Leaflet.markercluster
        └── wax

1(a). My leaflet mr config file (.mrconfig)
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

[Leaflet.ajax]
checkout = git clone 'https://github.com/calvinmetcalf/leaflet-ajax.git' 'Leaflet.ajax'

[Leaflet.pip]
checkout = git clone 'https://github.com/mapbox/leaflet-pip.git' 'Leaflet.pip'

[Leaflet.dvf]
checkout = git clone 'https://github.com/humangeo/leaflet-dvf.git' 'Leaflet.dvf'

[Leaflet.draw]
checkout = git clone 'https://github.com/Leaflet/Leaflet.draw.git' 'Leaflet.draw'

[Leaflet.label]
checkout = git clone 'https://github.com/Leaflet/Leaflet.label.git' 'Leaflet.label'
```

1(b). Install mr
```
brew install mr
```

1(c). Checkout the leaflet projects
```
mr --config _path_to_mr_config_ update
```

2. Install jsenv (rbenv for node)
```
brew install https://raw.github.com/johnlayton/farmclose/master/jsenv.rb
```

3. Install dependencies and start the server application

```
npm install -g jake &&\
npm install -g nodemon &&\
npm install &&\
jsenv rehash &&\
LEAFLET_PATH=_path_to_leaflet_ jake&&\
GATEWAY_USERNAME=_username_ GATEWAY_PASSWORD=_password_ npm run-script debug
```

eg:

```
npm install -g jake &&\
npm install -g nodemon &&\
npm install &&\
jsenv rehash &&\
LEAFLET_PATH=~/Development/public/leaflet jake&&\
GATEWAY_USERNAME=_username_ GATEWAY_PASSWORD=_password_ npm run-script debug
```

4. Start the client application

```
open "http://_your_ip_address_:8080
```
