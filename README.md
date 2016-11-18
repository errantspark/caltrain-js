#caltrain.js
simple caltrain CLI and lib

##installation
Unfortunately I wrote this in js so you've gotta have node installed, sorry.
```
npm install -no-optional -g caltrain-js
```

##usage
by default it will print the next train in either direction from the station that matches your query. if the next train is less than 10 minutes out it will also print the time for the one after that
```
trains RC 
```
```
NORTHBOUND from Redwood City in 0:10 @ 16:27
SOUTHBOUND from Redwood City in 0:03 @ 16:20
```
if you'd like to get the next train that connects a pair of stations you can use
```
trains RC PA 
```
```
next Redwood City to Palo Alto
```

