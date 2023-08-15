import { FC } from 'react';
import { DataProduct as DataProductType } from '../../common/api/collectionsApi';
import { TaxaCount } from './data_products/TaxaCount';
import { GenomeAttribs } from './data_products/GenomeAttribs';
import { Microtrait } from './data_products/Microtrait';
import { SampleAttribs } from './data_products/SampleAttribs';

export const DataProduct: FC<{
  dataProduct: DataProductType;
  collection_id: string;
}> = ({ dataProduct, collection_id }) => {
  switch (dataProduct.product) {
    case 'taxa_count':
      return <TaxaCount {...{ collection_id }} />;
    case 'genome_attribs':
      return <GenomeAttribs {...{ collection_id }} />;
    case 'microtrait':
      return <Microtrait {...{ collection_id }} />;
    case 'samples':
      return <SampleAttribs {...{ collection_id }} />;
    default:
      return <>No view implemented for DataProduct '{dataProduct.product}'</>;
  }
};
