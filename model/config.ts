export class Product {
    vSkuCode: number;
    vHourseCode: string;
    prettyName?: string;
    threshold?: number;
    stock?: number;
}

export class Config {
    botToken: string;
    apiHostname: string;
    apiPath: string;
    productPageUrl: string;
    pollingInterval: number;
    articles: Product[];
}
