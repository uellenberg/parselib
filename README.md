# ParseLib

## Notice
ParseLib is currently WIP and breaking changes are to be expected. Currently, it only supports parsing mathematical expressions and XML documents. It also does not yet have large file support.

## Info
ParseLib is a library for parsing different file formats, such as XML, JSON, and YAML, as well as simplifying the process of building your own parser. It includes some helpful classes for tokenization and for simplifying common sections of parsers. Documentation is currently unavailable, although everything is documented with JSDocs. If you want to build your own parser using ParseLib, take a look at how the existing parsers work and how the tests use them.

## Example
Below is an example of how to use the XML Parser to access information about a document. Please note that ParseLib only provides tools for parsing, it does not provide querying or any other components of a file type.
```typescript
import {ParseXML, XMLDocument} from "parselib";

const document: XMLDocument = ParseXML(`
<?xml version="1.0" encoding="UTF-8"?>
<movie id="1">
    <title>Example Movie</title>
    <released>
        <year>1999</year>
        <month>10</month>
        <day>18</day>
    </released>
    <company>Example Company</company>
</movie>
`);

console.log(document.content[0].content[0].content + " was made by " + document.content[0].content[2].content) // Example Movie was made by Example Company
```