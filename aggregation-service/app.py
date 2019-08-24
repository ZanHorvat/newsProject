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

# preload dictionaries
dict_names_si = open("dicts/names_si.txt", "r", encoding="utf8").read().split('\n')
dict_surnames_si = open("dicts/surnames_si.txt", "r", encoding="utf8").read().split('\n')



def setInterval(func, time):
    e = threading.Event()
    while not e.wait(time):
        func()

def findInterestingWords(tokens):

    interestingWords = []
    for dvojica in tokens:
        if (dvojica[1] in ['PROPN', 'CONJ', 'PUNCT', 'ADJ', 'NOUN', 'ADV'] \
                and str(dvojica[0])[0].isupper())\
                or dvojica[1] in dict_names_si\
                or dvojica[1] in dict_surnames_si:
            if(dvojica[0] not in interestingWords):
                interestingWords.append(str(dvojica[0]))

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


def grade(article):

    content = article.get("content")

    if content == None:
        return ''

    content, tokens = cleanAndTokanize(content)

    new_content = removeStopWordsAndLemmatisation(tokens)

    interestingWords = findInterestingWords(tokens)

    calculated_grade = round(len(interestingWords)/len(tokens), 2)

    myclient.find_one_and_update(article, {'$set': {'grade': calculated_grade}}, upsert=False)
    # print(interestingWords)

    return new_content

def removeStopWordsAndLemmatisation(tokens):

    new_content = ""

    stop_words = set(stopwords.words('slovene'))
    for tuple in tokens:

        x = tuple[0]
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
    datetime2daysAgo = datetime.now() - timedelta(hours=nHours);

    results = myclient.find({'updated': {'$gt': datetime2daysAgo}})
    articles = []

    for article in results:
        articles.append(article);
    groupArticles(articles);

    print("End cycle: In " + str(datetime.now() - startTime) + ' analyzed ' + str(len(articles)) + ' articles from the last ' + str(nHours) + ' hours.')

# Expects
def groupArticles(articles):
    """ groups similar articles adds """

    texts = articleContentToArray(articles)

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

            if cosine[y][x] > 0.5 and x != y:

                connectedArticles.append({'title': aX.get('title'), 'link': aX.get("link"), 'summary': aX.get("summary")})

                if(aY.get("grade") < aX.get("grade")):
                    shouldBeShown = False
                elif(aY.get("grade") == aX.get("grade") and aY.get("updated") < aX.get("updated")):
                    shouldBeShown = False

        myclient.find_one_and_update(aY, {'$set': {'connectedArticles': connectedArticles, 'show': shouldBeShown}})


def articleContentToArray(articles):
    """ Gets content of each article sends it to grading and append cleaned text to array"""
    texts = []

    for article in articles:
        content = grade(article)
        texts.append(content)

    return texts



myclient = pymongo.MongoClient("mongodb://localhost:27017/")["newsarticle"]["Articles"]
mainFunction()
setInterval(mainFunction, 10 * 60 * 1000)


# print(clean('V Ljubljani je v streljanju umrla ena oseba, so sporočili ljubljanski policisti. "Danes nekaj po 19. uri je bila Policijska uprava Ljubljana obveščena o varnostnem dogodku na območju Bežigrada. Po do sedaj zbranih obvestilih so policisti ugotovili, da je za posledicami uporabe strelnega orožja umrla ena oseba," so sporočili policisti.'))

