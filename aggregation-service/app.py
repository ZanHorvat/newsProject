import threading
import pymongo
import nltk
import lemmagen.lemmatizer
from lemmagen.lemmatizer import Lemmatizer
import string
import collections
import re
from nltk import word_tokenize
import datetime
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords
from pprint import pprint
import math
from nltk import word_tokenize, pos_tag, ne_chunk
from sklearn.feature_extraction.text import TfidfVectorizer
import lemmagen.lemmatizer
from lemmagen.lemmatizer import Lemmatizer


def setInterval(func, time):
    e = threading.Event()
    while not e.wait(time):
        func()

def clean(content):
    return re.sub("[!.?0-9]`", "", content.strip())

def mLemmanize(content):
    content = clean(content)
    tokens = word_tokenize(content)
    new_content = ""
    for x in tokens:
        lemmatizer = Lemmatizer(dictionary=lemmagen.DICTIONARY_SLOVENE)
        new_content += lemmatizer.lemmatize(x) + " "
    #print(new_content)
    return new_content


def foo():
    print(datetime.datetime.now())

    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient["newsarticle"]
    mycol = mydb["Articles"]

    myquery = {}

    mydoc = mycol.find(myquery)

    articles = []
    articles_whole = []

    for x in mydoc:
        content = x.get("content").replace("\n", "")
        content.replace("\t", "")
        #print(x.get("title"))

        content = mLemmanize(content)

        articles.append(content)
        articles_whole.append(x)



    vect = TfidfVectorizer()  # parameters for tokenization, stopwords can be passed
    tfidf = vect.fit_transform(articles)

    #print("TF-IDF vectors (each column is a document):\n{}\nRows:\n{}".format(tfidf.T.A, vect.get_feature_names()))

    cosine = (tfidf * tfidf.T).A

    size = len(articles)-1

    for y in range(0, size) :
        for x in range(0, size):
            if cosine[y][x] > 0.5:
                print(articles_whole[x].get("title") + " " + articles_whole[x].get("link") + ' ['+str(cosine[y][x])+']')
        print("\n")







# using
foo()
setInterval(foo, 5 * 60 * 1000)


