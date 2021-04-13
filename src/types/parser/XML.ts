/**
 * Represents data about an XML Entity.
 */
export interface XMLEntity {
    /**
     * The name of the entity. For example, `<title id="1">test</title>`'s name would be `title`.
     */
    name: string;
    /**
     * The attributes of the entity. For example, `<title id="1">test</title>`'s attributes would be `{id: "1"}`.
     */
    attributes: Record<string, string>;
    /**
     * The content of the entity. For example, `<title id="1">test</title>`'s content would be `test`, while `<title id="1"><something>else</something></title>`'s content would be `[{name: "something", attributes: {}, content: "else"}]`.
     */
    content: XMLEntity[] | string;
}

/**
 * Represents data about an XML Document.
 */
export interface XMLDocument {
    /**
     * The attributes of the document. These are the attributes of the `<?xml>` tag.
     */
    attributes: Record<string, string>;
    /**
     * The content of the document. This is a list of all of its top-level XML Entities.
     */
    content: XMLEntity[];
}