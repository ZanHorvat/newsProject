import threading
import sys


def setInterval(func, time):
    e = threading.Event()
    while not e.wait(time):
        func()


def foo():
    print("hello")


# using
print(sys.version)
setInterval(foo, 10 * 10 * 6000)
