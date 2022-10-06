export const missingLabelFactory = (id: string) => {
  return `Could not find the label for #${id}, has it been removed?`;
};

export const handlerPropError =
  'Specify exactly one of `changeHandler` and `validate`.';
