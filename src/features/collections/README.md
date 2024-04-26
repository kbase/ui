# Collections

The collections feature supports the collections service (as of writing, hosted
at: https://kbase.us/services/collections/docs).

The purpose of this README is to contain notes useful to developers, which may
not be easily grokked from the code.

### Special Casing for GTDB Collection

Due to difficulties loading the GTDB collection, some functionality had to be
special-cased to support its slightly different data schema. Once GTDB has been
updated to match the schema of the other collections, these should be removed.
These instances are marked with comments staring with `// GTDB`. As of writing,
these include:

- [// GTDB IDs are not (yet?) UPAs](https://github.com/kbase/ui/blob/abc33d5d357def6b3696aa2420cb500f17ea8d9f/src/features/collections/data_products/GenomeAttribs.tsx#L209)
- [// GTDB has different column names (#1)](https://github.com/kbase/ui/blob/abc33d5d357def6b3696aa2420cb500f17ea8d9f/src/features/collections/data_products/GenomeAttribs.tsx#L294)
- [// GTDB has different column names (#2)](https://github.com/kbase/ui/blob/abc33d5d357def6b3696aa2420cb500f17ea8d9f/src/features/collections/data_products/GenomeAttribs.tsx#L298-L300)
- [// GTDB has different column names (#3)](https://github.com/kbase/ui/blob/c3494d03bc1b6da9d43bcaf8aee66962c73b241a/src/features/collections/data_products/GenomeAttribs.tsx#L320)
