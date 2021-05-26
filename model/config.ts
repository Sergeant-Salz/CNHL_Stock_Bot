export class Product {
    vSkuCode: number;
    vHourseCode: string;
    prettyName?: string;
    threshold?: number;
}

export class Config {
    apiHostname: string;
    apiPath: string;
    articles: Product[];
}
