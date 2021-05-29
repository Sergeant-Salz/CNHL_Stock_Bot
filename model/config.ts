export class Product {
    vSkuCode: number;
    vHourseCode: string;
    prettyName?: string;
    threshold?: number;
    stock?: number;
}

export class Config {
    apiHostname: string;
    apiPath: string;
    articles: Product[];
}
