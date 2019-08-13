module.exports.sources = {
    'rtvslo.si': {
        source: 'https://stari.rtvslo.si/feeds/00.xml',
        summary_selector: '.lead',
        content_selector: '.article-body',
        comments_selector: '.numComments',
        category_selector: '#main-container > div > div > header > div > h3'
    }, 
    'delo.si': {
        source: 'https://www.delo.si/rss/',
        summary_selector: '.itemSubtitle',
        content_selector: '.itemFullText',
        comments_selector: '._50f7',
        category_selector: '#t3-content > div.container.break_cont.break_00_cont.outter_cont.item_break_00 > div > div > div > ul > li:nth-child(3) > span'
    },
    '24ur.com': {
        source: 'https://www.24ur.com/rss',
        summary_selector: '.article__summary',
        content_selector: '.article__body-dynamic',
        comments_selector: '.article__details-main',
        category_selector: 'div.label.article__label'
    },
    'siol.net': {
        source: 'https://siol.net/feeds/latest',
        summary_selector: 'body > div.body_wrap > div > div:nth-child(3) > div.grid-12.no-gutter.gutter-lg.gutter-xlg.article__wrap > div.column_content > div > article > div.article__body--content.js_articleBodyContent > div.article__intro.js_articleIntro > p',
        content_selector: 'body > div.body_wrap > div > div:nth-child(3) > div.grid-12.no-gutter.gutter-lg.gutter-xlg.article__wrap > div.column_content > div > article > div.article__body--content.js_articleBodyContent > div.article__main.js_article.js_bannerInArticleWrap',
        comments_selector: 'body > div.body_wrap > div > div:nth-child(3) > div.grid-12.no-gutter.gutter-lg.gutter-xlg.article__wrap > div.column_content > div > article > div.article__additional > div.article__comments.js_articleComments.cf > div > div.comments__heading_wrap.cf > span > i',
        category_selector: 'body > div.body_wrap > div > div:nth-child(3) > div.grid-12.no-gutter.gutter-lg.gutter-xlg.article__wrap > div.article__breadcrumbs > a:nth-child(3)'
    }
}
