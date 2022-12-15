import { useParams, useNavigate } from 'react-router-dom';
import { getCollection } from '../../common/api/collectionsApi';
import { usePageTitle } from '../layout/layoutSlice';
import styles from './Collections.module.scss';
import { Card, CardList } from '../../common/components/Card';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { DataProduct } from './DataProduct';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import * as d3 from 'd3';
import { useD3Viz } from './d3Hook';
import { Table } from '../../common/components/Table';

export const CollectionDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const collectionQuery = getCollection.useQuery(params.id || '', {
    skip: params.id === undefined,
  });
  const collection = collectionQuery.data;
  usePageTitle(`Data Collections`);

  const currDataProduct = collection?.data_products.find(
    (dp) => dp.product === params.data_product
  );

  // Redirect if the data_product specified by the url DNE
  useEffect(() => {
    if (params.data_product && collection && !currDataProduct) {
      navigate(`/collections/${params.id}`);
    }
  }, [params.id, params.data_product, collection, currDataProduct, navigate]);

  if (!collection) return <>loading...</>;
  return (
    <div className={styles['collection_wrapper']}>
      <div className={styles['collection_detail']}>
        <div className={styles['detail_header']}>
          <img
            src={collection.icon_url}
            alt={`${collection.name} collection icon`}
          />
          <span>{collection.name}</span>
        </div>

        <p>{collection.desc}</p>

        <ul>
          <li>
            Version:{' '}
            <strong>
              v{collection.ver_num}: {collection.ver_tag}
            </strong>
          </li>
        </ul>
      </div>
      <div className={styles['data_products']}>
        <Tree />
      </div>
      <div className={styles['data_products']}>
        <CardList className={styles['data_product_list']}>
          {collection.data_products.map((dp) => (
            <Card
              key={dp.product + '|' + dp.version}
              title={snakeCaseToHumanReadable(dp.product)}
              subtitle={dp.version}
              onClick={() =>
                navigate(`/collections/${collection.id}/${dp.product}`)
              }
              selected={currDataProduct === dp}
            />
          ))}
        </CardList>
        <div className={styles['data_product_detail']}>
          {currDataProduct ? (
            <DataProduct
              dataProduct={currDataProduct}
              collection_id={collection.id}
            />
          ) : (
            <div className={styles['data_product_placeholder']}>
              <span>Select a Data Product</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface Node {
  nodeId: string;
  parent?: Node['nodeId'];
  rootDist: number;
  leaves:
    | { isLeaf: true; index: number }
    | { isLeaf: false; span: [number, number] };
}

const someNodes: Node[] = [
  { nodeId: '24', rootDist: 0.0, leaves: { isLeaf: false, span: [0, 13] } },
  {
    nodeId: '6',
    rootDist: 1.0,
    parent: '24',
    leaves: { isLeaf: false, span: [0, 4] },
  },
  {
    nodeId: '23',
    rootDist: 1.0,
    parent: '24',
    leaves: { isLeaf: false, span: [4, 13] },
  },
  {
    nodeId: '2',
    rootDist: 2.0,
    parent: '6',
    leaves: { isLeaf: false, span: [0, 2] },
  },
  {
    nodeId: '5',
    rootDist: 2.0,
    parent: '6',
    leaves: { isLeaf: false, span: [2, 4] },
  },
  {
    nodeId: '9',
    rootDist: 2.0,
    parent: '23',
    leaves: { isLeaf: false, span: [4, 6] },
  },
  {
    nodeId: '22',
    rootDist: 2.0,
    parent: '23',
    leaves: { isLeaf: false, span: [6, 13] },
  },
  {
    nodeId: '0',
    rootDist: 3.0,
    parent: '2',
    leaves: { isLeaf: true, index: 0 },
  },
  {
    nodeId: '1',
    rootDist: 3.0,
    parent: '2',
    leaves: { isLeaf: true, index: 1 },
  },
  {
    nodeId: '3',
    rootDist: 3.0,
    parent: '5',
    leaves: { isLeaf: true, index: 2 },
  },
  {
    nodeId: '4',
    rootDist: 3.0,
    parent: '5',
    leaves: { isLeaf: true, index: 3 },
  },
  {
    nodeId: '7',
    rootDist: 3.0,
    parent: '9',
    leaves: { isLeaf: true, index: 4 },
  },
  {
    nodeId: '8',
    rootDist: 3.0,
    parent: '9',
    leaves: { isLeaf: true, index: 5 },
  },
  {
    nodeId: '18',
    rootDist: 3.0,
    parent: '22',
    leaves: { isLeaf: false, span: [6, 11] },
  },
  {
    nodeId: '21',
    rootDist: 3.0,
    parent: '22',
    leaves: { isLeaf: false, span: [11, 13] },
  },
  {
    nodeId: '10',
    rootDist: 4.0,
    parent: '18',
    leaves: { isLeaf: true, index: 6 },
  },
  {
    nodeId: '17',
    rootDist: 4.0,
    parent: '18',
    leaves: { isLeaf: false, span: [7, 11] },
  },
  {
    nodeId: '19',
    rootDist: 4.0,
    parent: '21',
    leaves: { isLeaf: true, index: 11 },
  },
  {
    nodeId: '20',
    rootDist: 4.0,
    parent: '21',
    leaves: { isLeaf: true, index: 12 },
  },
  {
    nodeId: '11',
    rootDist: 5.0,
    parent: '17',
    leaves: { isLeaf: true, index: 7 },
  },
  {
    nodeId: '16',
    rootDist: 5.0,
    parent: '17',
    leaves: { isLeaf: false, span: [8, 11] },
  },
  {
    nodeId: '12',
    rootDist: 6.0,
    parent: '16',
    leaves: { isLeaf: true, index: 8 },
  },
  {
    nodeId: '15',
    rootDist: 6.0,
    parent: '16',
    leaves: { isLeaf: false, span: [9, 11] },
  },
  {
    nodeId: '13',
    rootDist: 7.0,
    parent: '15',
    leaves: { isLeaf: true, index: 9 },
  },
  {
    nodeId: '14',
    rootDist: 7.0,
    parent: '15',
    leaves: { isLeaf: true, index: 10 },
  },
];
const Tree = () => {
  const vizOpts = {
    treeWidth: 300,
    treeLabelWidth: 40,
    heightPerLeaf: 35,
    pad: 10,
  };

  const [nodeList, setNodeList] = useState<Node[]>(someNodes);
  const [leafCount, setLeafCount] = useState<number>(1);

  const treeLayout = d3
    .cluster<Node>()
    .nodeSize([vizOpts.heightPerLeaf, 1])
    .separation(() => 1);

  const hierarchy = useMemo(
    () =>
      d3
        .stratify<Node>()
        .id((n) => n.nodeId)
        .parentId((n) => n.parent)(nodeList) /*.sort*/,
    [nodeList]
  );

  const hiddenChildren: { [k: string]: any[] } = useMemo(
    () => ({}),
    [hierarchy]
  );

  const { svgElement, redraw } = useD3Viz({
    init: (svg) => {
      svg
        .attr('width', vizOpts.treeWidth)
        .attr('height', vizOpts.heightPerLeaf);
      svg.append('g').classed('edge-layer', true);
      svg.append('g').classed('node-layer', true);
    },
    draw: (svg) => {
      // Produces a tree layout (with X and Y flipped from what we want)
      const treeRoot = treeLayout(hierarchy);

      const currLeafCount = treeRoot.leaves().length;
      setLeafCount(currLeafCount);
      svg.attr('height', currLeafCount * vizOpts.heightPerLeaf);

      const xExtent = d3.extent(
        treeRoot.descendants().map((d) => d.data.rootDist)
      );
      const xScale = d3
        .scaleLinear([
          vizOpts.pad,
          Number(svg.attr('width')) - vizOpts.pad - vizOpts.treeLabelWidth,
        ])
        .domain([xExtent[0] ?? 0, xExtent[1] ?? 0]);

      const yExtent = d3.extent(treeRoot.descendants().map((d) => d.x));
      const yScale = d3
        .scaleLinear([
          vizOpts.pad + vizOpts.heightPerLeaf / 2,
          Number(svg.attr('height')) - vizOpts.pad - vizOpts.heightPerLeaf / 2,
        ])
        .domain([yExtent[0] ?? 0, yExtent[1] ?? 0]);

      const nodes = svg
        .select('g.node-layer')
        .selectAll<SVGGElement, d3.HierarchyPointNode<Node>>('g.node')
        .data<d3.HierarchyPointNode<Node>>(treeRoot.descendants());
      nodes.exit().remove();
      const nodesEnt = nodes.enter().append('g').classed('node', true);
      nodesEnt.append('circle').attr('cx', 0).attr('cy', 0).append('title');
      nodesEnt
        .append('text')
        .attr('x', 8)
        .attr('y', 5 / 2)
        .attr('font-size', '10px');
      const allNodes = nodesEnt.merge(nodes);
      allNodes.attr(
        'transform',
        (d) => `translate(${xScale(d.data.rootDist)},${yScale(d.x) || 0})`
      );
      allNodes
        .select('circle')
        .attr('r', (d) => (d.data.leaves.isLeaf ? 5 : 3));
      allNodes.select('circle title').text((d) => String(d.id));

      allNodes
        .select('text')
        .text((d) => (d.data.leaves.isLeaf ? `Node ${d.id}` : ''));

      allNodes
        .on('click', null)
        .filter((d) => !d.data.leaves.isLeaf)
        .on('click', (event, d) => {
          console.log('foo');
          if (d.children) {
            hiddenChildren[d.data.nodeId] = d.children;
            d.children = undefined;
          } else if (d.data.nodeId in hiddenChildren) {
            d.children = hiddenChildren[d.data.nodeId];
            delete hiddenChildren[d.data.nodeId];
          }
          redraw();
        });

      const dashLineLayout = d3.line();
      const dLines = svg
        .select('g.edge-layer')
        .selectAll<SVGGElement, d3.HierarchyPointNode<Node>>('g.dash-line')
        .data(treeRoot.descendants().filter((d) => d.data.leaves.isLeaf));
      dLines.exit().remove();
      const dLinesEnt = dLines.enter().append('g').classed('dash-line', true);
      dLinesEnt
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'grey')
        .attr('stroke-dasharray', '1');
      const allDLines = dLinesEnt.merge(dLines);
      allDLines.select('path').attr('d', (d) =>
        dashLineLayout([
          [xScale(d.data.rootDist), yScale(d.x)],
          [vizOpts.treeWidth, yScale(d.x)],
        ])
      );

      const edges = svg
        .select('g.edge-layer')
        .selectAll<SVGGElement, d3.HierarchyPointLink<Node>>('g.edge')
        .data(treeRoot.links());
      edges.exit().remove();
      const edgesEnt = edges.enter().append('g').classed('edge', true);
      edgesEnt.append('path').attr('fill', 'none').attr('stroke', 'black');
      const allLinks = edgesEnt.merge(edges);
      allLinks.select('path').attr(
        'd',
        d3
          .link<d3.HierarchyPointLink<Node>, d3.HierarchyPointNode<Node>>(
            d3.curveStepBefore
          )
          .y((d) => yScale(d.x) || 0)
          .x((d) => xScale(d.data.rootDist) || 0)
      );
    },
  });

  useEffect(redraw, [redraw, nodeList]);

  const tableData = useMemo(
    () => d3.range(leafCount).map((d) => [d]),
    [leafCount]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'row nowrap',
        position: 'relative',
        height: 'min-content',
      }}
    >
      <div style={{ width: vizOpts.treeWidth }}>{svgElement}</div>
      <div
        style={{
          height: leafCount * vizOpts.heightPerLeaf,
          paddingTop: vizOpts.pad,
          paddingBottom: vizOpts.pad,
        }}
      >
        <Table
          data={tableData}
          columnDefs={(column) => [
            column.accessor((d) => d[0], {
              id: '0',
              header: undefined,
              cell: (d) => (
                <span
                  style={{
                    color: hierarchy.leaves()[d.cell.getValue()].data.leaves
                      .isLeaf
                      ? 'green'
                      : 'red',
                  }}
                >
                  {hierarchy.leaves()[d.cell.getValue()].data.nodeId}
                </span>
              ),
            }),
          ]}
        />
      </div>
    </div>
  );
};
