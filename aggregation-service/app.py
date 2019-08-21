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

def setInterval(func, time):
    e = threading.Event()
    while not e.wait(time):
        func()


def clean(content):
    content = content.replace('.', ' ')
    content = content.replace(',', ' ')
    content = content.replace('!', ' ')
    content = content.replace('?', ' ')
    content = content.replace(')', ' ')
    content = content.replace('(', ' ')
    content = content.replace('\'\'', ' ')
    content = content.replace('&#96', ' ')
    content = content.replace('-', ' ')
    content = content.replace('\u0027', ' ')
    remove_digits = str.maketrans('', '', digits)
    content = content.translate(remove_digits)
    return re.sub("[!.?0-9]`", " ", content.strip())


def grade(article):

    content = article.get("content")

    if content == None:
        return ''

    content = clean(content)
    tokens = word_tokenize(content)
    new_content = ""

    stop_words = set(stopwords.words('slovene'))

    # print(content);

    for x in tokens:

        x = x + ' '
        if x.lower() not in stop_words:
            x = x.strip()
            lemmatizer = Lemmatizer(dictionary=lemmagen.DICTIONARY_SLOVENE)
            lemmanizedWord = lemmatizer.lemmatize(x)
            new_content += lemmanizedWord + " "

    interestingWords = []


    text = Text(new_content, hint_language_code='sl')
    for dvojica in text.pos_tags:

        if(len(dvojica[0]) < 3):
            text.pos_tags.remove(dvojica)

        if(dvojica[1] in ['PROPN', 'CONJ', 'PUNCT', 'ADJ', 'NOUN', 'ADV'] and len(dvojica[0]) > 2 and str(dvojica[0])[0].isupper()):
            # print(dvojica[0] + ' ' + dvojica[1])
            if(dvojica[0] not in interestingWords ):
                interestingWords.append(str(dvojica[0]))

    calculated_grade = round(len(interestingWords)/len(text.pos_tags), 2)

    print(str(len(content)) + ' -> ' + str(calculated_grade))
    print(interestingWords)
    # print(interestingWords)
    print()

    print(article)
    # myclient.find_one_and_update(article, {'$set': {'grade': calculated_grade, 'otherSubjects': interestingWords}})

    # print(len(text.pos_tags)/(len(tokens)))

    return new_content


def mainFunction():

    print("Interval: " + str(datetime.now()))

    stop_words = set(stopwords.words('slovene'))
    if ('komaj ' in stop_words):
        print('Hey')

    datetime2daysAgo = datetime.now() - timedelta(days=2);
    myquery = {'updated': {'$gt': datetime2daysAgo}}
    results = myclient.find(myquery)


    groupArticles(results);

def groupArticles(results):
    articles = []
    articles_whole = []

    for x in results:
        print(x.get("title"))

        content = grade(x)

        articles.append(content)
        articles_whole.append(x)

    vect = TfidfVectorizer()  # parameters for tokenization, stopwords can be passed
    tfidf = vect.fit_transform(articles)

    print("TF-IDF vectors (each column is a document):\n{}\nRows:\n{}".format(tfidf.T.A, vect.get_feature_names()))

    cosine = (tfidf * tfidf.T).A

    size = len(articles) - 1

    for y in range(0, size):

        # Printing main article
        print(articles_whole[y].get("link") + ' ' + str(articles_whole[y].get("grade")))

        connectedArticles = []

        for x in range(0, size):
            if cosine[y][x] > 0.7 and cosine[y][x] < 0.99:

                # Preparing similar article
                print('[' + str(round(cosine[y][x], 2)) + ' grade: ' + str(articles_whole[x].get("grade")) + ' ' + str(len(articles_whole[x].get("content")))+'] ' + articles_whole[x].get("title") + " " + articles_whole[x].get("link"))

                connectedArticles.append({'title': articles_whole[x].get('title'), 'link': articles_whole[x].get("link"), 'summary': articles_whole[x].get("summary")})

        myclient.find_one_and_update(articles_whole[y], {'$set': {'connectedArticles': connectedArticles}})






myclient = pymongo.MongoClient("mongodb://localhost:27017/")["newsarticle"]["Articles"]

mainFunction()

# setInterval(mainFunction, 5 * 60 * 1000)
