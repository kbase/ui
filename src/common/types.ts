/*
 Meta is meant to be JSON-like and understandable to the typescript compiler.
*/

type Scalar = null | boolean | number | string;

export type JSONSerializable =
  | Scalar
  | Array<Scalar | JSONSerializable>
  | {
      [key: string]: JSONSerializable;
    };
