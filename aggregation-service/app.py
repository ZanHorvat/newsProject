import threading
import pymongo


def setInterval(func, time):
    e = threading.Event()
    while not e.wait(time):
        func()


def foo():
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient["newsarticle"]
    mycol = mydb["Articles"]

    myquery = {}

    mydoc = mycol.find(myquery)

    for x in mydoc:
        print(x.get("source"))


# using
foo()
setInterval(foo, 10 * 10 * 6000)
