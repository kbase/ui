import { FC } from 'react';
import { DataProduct as DataProductType } from '../../common/api/collectionsApi';
import { TaxaCount } from './data_products/TaxaCount';
import { GenomeAttribs } from './data_products/GenomeAttribs';
import { Microtrait } from './data_products/Microtrait';

export const DataProduct: FC<{
  dataProduct: DataProductType;
  collection_id: string;
}> = ({ dataProduct, collection_id }) => {
  if (dataProduct.product === 'taxa_count') {
    return <TaxaCount {...{ collection_id }} />;
  } else if (dataProduct.product === 'genome_attribs') {
    return <GenomeAttribs {...{ collection_id }} />;
  } else if (dataProduct.product === 'microtrait') {
    return <Microtrait {...{ collection_id }} />;
  } else {
    return <>'Invalid Data Product Type'</>;
  }
};
