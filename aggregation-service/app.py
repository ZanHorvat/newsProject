import threading
import pymongo
import lemmagen.lemmatizer
import re
import datetime
from polyglot.text import Text
from nltk.corpus import stopwords
from datetime import datetime, timedelta
from nltk import word_tokenize, pos_tag, ne_chunk
from sklearn.feature_extraction.text import TfidfVectorizer
import lemmagen.lemmatizer
from string import digits
from lemmagen.lemmatizer import Lemmatizer
from difflib import SequenceMatcher
from threading import Timer
from urllib.parse import urlparse

# preload dictionaries
dict_names_si = open("dicts/names_si.txt", "r", encoding="utf8").read().split('\n')
dict_surnames_si = open("dicts/surnames_si.txt", "r", encoding="utf8").read().split('\n')
dict_places_si = open("dicts/places_si.txt", "r", encoding="utf8").read().split('\n')

def setInterval(func, sec):
    def func_wrapper():
        setInterval(func, sec)
        func()
    t = threading.Timer(sec, func_wrapper)
    t.start()
    return t

def findInterestingWords(tokens):

    interestingWords = []
    for dvojica in tokens:
        if (dvojica[1] in ['PROPN', 'NOUN', 'PUNCT'])\
                or dvojica[0] in dict_names_si\
                or dvojica[0] in dict_places_si\
                or dvojica[0] in dict_surnames_si:

            if(dvojica[0] not in interestingWords):
                interestingWords.append(str(dvojica[0]))

    # print(tokens)

    return interestingWords

def cleanAndTokanize(content):
    """ Uses postaging function to clean return tuple of (merged text and)"""

    cleaned = ""
    text = Text(content, hint_language_code='sl')

    tokens = []

    for x in range(len(text.pos_tags)-1):
        word = text.pos_tags[x]
        if (len(word[0]) > 2):
            cleaned += ' ' + word[0]
            tokens.append(word)

    remove_digits = str.maketrans('', '', digits)
    cleaned = cleaned.translate(remove_digits)

    return cleaned.lstrip(), tokens


def prepareAndGradeArticle(article):
    content = article.get("content")
    if content == None:
        return ''

    tokens = []
    new_content = ""

    if(article.get("grade") == 0):
        print("Grading " + article.get("title") + ': ' + str(datetime.now()))
        content, tokens = cleanAndTokanize(content)

        interestingWords = findInterestingWords(tokens)

        nTokens = len(tokens)

        if(nTokens == 0):
            nTokens = 1

        calculated_grade = round(len(interestingWords) / nTokens, 2)

        new_content = removeStopWordsAndLemmatisation(tokens)

        myclient.find_one_and_update(article, {'$set': {'grade': calculated_grade}}, upsert=False)
    else:
        print("Preparing " + article.get("title") + ': ' + str(datetime.now()))
        tokens = word_tokenize(content)
        new_content = removeStopWordsAndLemmatisation(tokens)

    return new_content

def removeStopWordsAndLemmatisation(tokens):

    new_content = ""

    stop_words = set(stopwords.words('slovene'))
    for token in tokens:
        if type(token) == tuple:
            x = token[0]
        else:
            x = token
        # broken library / issue slovenian words have whitespaces behind
        x = x + ' '

        if x.lower() not in stop_words:
            x = x.strip()
            lemmatizer = Lemmatizer(dictionary=lemmagen.DICTIONARY_SLOVENE)
            lemmanizedWord = lemmatizer.lemmatize(x)
            new_content += lemmanizedWord + " "

    return new_content


def mainFunction():

    startTime = datetime.now()

    print("Start cycle: " + str(startTime))

    nHours = 48
    timepast = datetime.now() - timedelta(hours=nHours);

    results = myclient.find({'updated': {'$gt': timepast}})
    articles = []

    for article in results:
        articles.append(article);
    groupArticles(articles);

    print("End cycle: In " + str(datetime.now() - startTime) + ' analyzed ' + str(len(articles)) + ' articles from the last ' + str(nHours) + ' hours.')
    Timer(10, mainFunction).start()

def fromSameSource(aY, aX):
    urlY = aY.get("link")
    urlX = aX.get("link")

    parsedUrlY = urlparse(urlY)
    parsedUrlX = urlparse(urlX)

    print("Compring sources: " + urlY + ' and ' + urlX)

    return parsedUrlX.netloc == parsedUrlY.netloc


# Expects
def groupArticles(articles):
    """ groups similar articles adds """
    startTime = datetime.now()
    print("Collecting and grading ...")
    texts = articleContentToArray(articles)
    print("collecting and grading done in " + str(datetime.now() - startTime))
    # parameters for tokenization, stopwords can be passed
    vect = TfidfVectorizer() 
    
    if(len(texts)):
        tfidf = vect.fit_transform(texts)
    else:
        return

    cosine = (tfidf * tfidf.T).A

    size = len(articles) - 1

    for y in range(0, size):
        shouldBeShown = True;

        aY = articles[y]

        connectedArticles = []

        for x in range(0, size):

            aX = articles[x]

            if 0.5 < cosine[y][x] and x != y:

                if not (0.95 < cosine[y][x] and fromSameSource(aY, aX)):
                    connectedArticles.append({'title': aX.get('title'), 'link': aX.get("link"), 'summary': aX.get("summary")})

                if aY.get("grade") < aX.get("grade"):
                    shouldBeShown = False
                elif aY.get("grade") == aX.get("grade") and aY.get("updated") < aX.get("updated"):
                    shouldBeShown = False

        myclient.find_one_and_update(aY, {'$set': {'connectedArticles': connectedArticles, 'show': shouldBeShown}})


def articleContentToArray(articles):
    """ Gets content of each article sends it to grading and append cleaned text to array"""
    texts = []

    for article in articles:
        content = prepareAndGradeArticle(article)
        texts.append(content)

    return texts



myclient = pymongo.MongoClient("mongodb://localhost:27017/")["newsarticle"]["Articles"]
mainFunction()
