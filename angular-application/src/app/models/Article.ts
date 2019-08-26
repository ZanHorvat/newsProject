// tslint:disable: ban-types

export class Article {
    link: { type: String };
    title: { type: String };
    summary: { type: String };
    content: { type: String };
    category: { type: String };
    connectedArticles: {
        title: String
        link: String
        summary: String
    };
}
