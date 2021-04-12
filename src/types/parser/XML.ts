export interface XMLEntity {
    name: string;
    attributes: Record<string, string>;
    content: XMLEntity[] | string;
}