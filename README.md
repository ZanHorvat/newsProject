## Installation


```
git clone https://github.com/ZanHorvat/newsProject.git
cd newsProject
cd crawler-service
```

Run each in it's own terminal.
```
cd crawler service
npm start
```
```
cd aggregation-service
python service.py
```
```
cd angular-service
ng serve -o
```

## Crawler Service (JavaScript)

Runs based on news sources defined in `crawler-service\dictionaries\sources.js`. Compares and addes new articles from rss source and provides REST API get point for categories listed in `crawler-service\dictionaries\categories.js`. 

API is returning the 100 most recent one.

## Aggregation Service (Python 3.7)

Operates on given given Mongo database groups and grades queried for the last 48 hours.

Supported languages:
- Slovene

Data for `aggregation-service/dicts/names_si.txt` and `aggregation-service/dicts/surnames_si.txt` and `aggregation-service/dicts/places_si.txt` was collected at [Statistični urad Republike Slovenije](https://www.stat.si/statweb).

## Angular Application (TypeScript 3.2.4)

User interface which turns json from REST API responses to cards.


