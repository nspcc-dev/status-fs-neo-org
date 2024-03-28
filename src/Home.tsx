import React, { useEffect } from 'react';
import {
	Container,
	Table,
	Section,
	Heading,
	Tile,
	Notification,
} from 'react-bulma-components';
import { NodeMap, Node } from './App.tsx';
import worldData from './world_data.json';

declare global {
  interface Window {
    d3:any
    topojson:any
  }
}

interface WorldData {
  type: string
  transform: {
		scale: number[]
  	translate: number[]
	}
  objects: {
		countries: {
			type: string
			geometries: Geometry[]
			bbox: number[]
		}
	}
  arcs: number[][][]
  bbox: number[]
}

interface Geometry {
  type?: string
  arcs?: any[][]
  id: number
  properties: {
		name: string
		color: string
	}
}

const Home = ({
	activeNet,
	location,
	isError,
	isLoading,
	data,
}) => {
	useEffect(() => {
		const mapcontainer: HTMLElement | null = document.getElementById('mapcontainer');
		if (mapcontainer) {
			onInitMap(activeNet, mapcontainer);
		}
	},[data, location]); // eslint-disable-line react-hooks/exhaustive-deps

	const onInitMap = (activeNet: string, mapcontainer: HTMLElement) => {
    const width: number = mapcontainer.offsetWidth;
		const height: number = width / 1.5;

		mapcontainer.innerHTML = '';

		const projection: any = window.d3
			.geo
			.mercator()
			.translate([(width / 2), (height / 1.4)])
			.scale(width / 2 / Math.PI);
		const path: any = window.d3
			.geo
			.path()
			.projection(projection);
		const svg: any = window.d3
			.select("#mapcontainer")
			.append("svg")
			.attr("width", width)
			.attr("height", height + 8)
			.append("g");
		const g: any = svg
			.append("g");

		const net: string = activeNet === 'mainnet' ? 'main' : 'test';
		const world: WorldData = JSON.parse(worldData.content);
		const countries: any = window.topojson.feature(world, world.objects.countries).features;
		const country: any = g.selectAll(".country").data(countries);
		country
			.enter()
			.insert("path")
			.attr("class", "country")
			.attr("d", path)
			.attr("id", (d: any) => d.id)
			.style("fill", '#49cc90');

		const tip: any = window.d3
			.select("body")
			.append("div");
		g.selectAll("circle")
			.data(data.node_map.filter((item: NodeMap) => item.nodes.map((node: Node) => node.net).indexOf(net) !== -1))
			.enter()
			.append("circle")
			.attr("class", "mapcircle")
			.attr("cx", (d: any) => projection([d.longitude, d.latitude])[0])
			.attr("cy", (d: any) => projection([d.longitude, d.latitude])[1])
			.attr("r", "7")
			.on("mouseover", (d: NodeMap) => {
				const circ: any = window.d3.select(this);
				circ.attr("class", "mouseover mapcircle");
				tip.html(`
					<div class='title is-6' style='margin-bottom: 10px'>${d.location}</div>
					<div>${activeNet === 'mainnet' ? 'Mainnet' : 'Testnet'}: ${d.nodes.filter((item: Node) => item.net === net)[0].value} node${d.nodes.filter((item: Node) => item.net === net)[0].value > 1 ? 's' : ''}</div>
				`);
				tip.transition()
					.attr("class", "tooltip")
					.style("display", "block");
				tip.style("left", window.d3.event.pageX + 5 + "px")
					.style("top", window.d3.event.pageY - 25 + "px");
			})
			.on("mouseout", () => {
				const circ: any = window.d3.select(this);
				circ.attr("class", "mouseout mapcircle");
				tip.transition()
					.style("display", "none");
			});
	};

  const getColorStatus = (status: string): string => {
		let color: string = 'success';
		if (status === 'Healthy') {
			color = 'success';
		} else if (status === 'Degraded') {
			color = 'warning';
		} else if (status === 'Severe') {
			color = 'danger';
		} else if (status === 'Unknown') {
			color = 'grey';
		}
    return color;
	};

	function checkRelevanceData(): boolean {
		const currentTimestamp: number = new Date().getTime();
		const dataTimeMs: number = data.time * 1000;
		const timeRelevance: number = 2 * 300000; // new data generate each 300000 ms, check for double missing data time
    return currentTimestamp - dataTimeMs < timeRelevance;
	};

  return (
		<Container>
			{!isLoading ? (
				<>
					{!isError && data ? (
						<Section>
							<Tile
								id="status"
								kind="child"
								renderAs={Notification}
								color={getColorStatus(checkRelevanceData() ? data.status[activeNet] : 'Unknown')}
								style={{ marginTop: '1.5rem' }}
							>
								<Heading>{`${activeNet === 'mainnet' ? 'Mainnet' : 'Testnet'}: ${checkRelevanceData() ? data.status[activeNet] : 'Unknown'}`}</Heading>
								{data.statusmsgs && data.statusmsgs[activeNet] && data.statusmsgs[activeNet].map((statusMsgItem: string) => (
									<Heading
										key={statusMsgItem}
										subtitle
										size={6}
									>{`- ${statusMsgItem}`}</Heading>
								))}
							</Tile>
							<Tile kind="ancestor" style={{ marginTop: '1.5rem' }} id="main">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Heading subtitle size={6}>
											{`Network epoch: `}
											<span>{data.network_epoch && data.network_epoch[activeNet]}</span>
										</Heading>
										<Heading subtitle size={6}>
											{`Containers: `}
											<span>{data.containers && data.containers[activeNet]}</span>
										</Heading>
									</Tile>
								</Tile>
							</Tile>
							<Tile kind="ancestor">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Heading subtitle weight="semibold">NeoFS contract</Heading>
										<Heading subtitle size={6}>
											<span>{`Address: `}</span>
											{data.contract && data.contract[activeNet].address}
										</Heading>
										<Heading subtitle size={6}>
											<span>{`Script hash: `}</span>
											{`0x${data.contract && data.contract[activeNet].script_hash}`}
										</Heading>
									</Tile>
								</Tile>
							</Tile>
							<Tile kind="ancestor">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Heading subtitle weight="semibold">Test gateway</Heading>
										<div className="info_caption">
											<p>This is a public gateway that MUST NOT be used for production applications, but it can be used for test purposes.</p>
											<p>It's a centralization point and it's not guaranteed to always be available.</p>
										</div>
										<Table.Container>
											<Table>
												<thead>
													<tr>
														<th>
															<abbr>
																REST
															</abbr>
														</th>
													</tr>
												</thead>
												<tbody>
													{data.gateways && data.gateways[activeNet].map((node: string[]) => (
														<tr key={node[1]}>
															<td>
																{node[1]}
															</td>
														</tr>
													))}
												</tbody>
											</Table>
										</Table.Container>
									</Tile>
								</Tile>
							</Tile>
							<Tile kind="ancestor">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Heading subtitle weight="semibold">Storage nodes</Heading>
										<Table.Container>
											<Table>
												<thead>
													<tr>
														<th>
															<abbr>
																Secured(TLS) endpoint
															</abbr>
														</th>
														<th>
															<abbr>
																Insecure endpoint
															</abbr>
														</th>
													</tr>
												</thead>
												<tbody>
													{data.storage_nodes && data.storage_nodes[activeNet].map((node: string[]) => (
														<tr key={node[0]}>
															<td>
																{node[0]}
															</td>
															<td>
																{node[1]}
															</td>
														</tr>
													))}
												</tbody>
											</Table>
											</Table.Container>
									</Tile>
								</Tile>
							</Tile>
							<Tile kind="ancestor">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Heading subtitle weight="semibold">NeoGo RPC nodes</Heading>
										<Table.Container>
											<Table>
												<thead>
													<tr>
														<th>
															<abbr>
																JSON RPC
															</abbr>
														</th>
														<th>
															<abbr>
																Websocket RPC
															</abbr>
														</th>
													</tr>
												</thead>
												<tbody>
													{data.neo_go_rpc_nodes && data.neo_go_rpc_nodes[activeNet].map((node: string[]) => (
														<tr key={node[0]}>
															<td>
																{node[0]}
															</td>
															<td>
																{node[1]}
															</td>
														</tr>
													))}
												</tbody>
											</Table>
											</Table.Container>
									</Tile>
								</Tile>
							</Tile>
							<Tile kind="ancestor">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Heading subtitle weight="semibold">Side chain RPC nodes</Heading>
										<Table.Container>
											<Table>
												<thead>
													<tr>
														<th>
															<abbr>
																JSON RPC
															</abbr>
														</th>
														<th>
															<abbr>
																Websocket RPC
															</abbr>
														</th>
													</tr>
												</thead>
												<tbody>
													{data.side_chain_rpc_nodes && data.side_chain_rpc_nodes[activeNet].map((node: string[]) => (
														<tr key={node[0]}>
															<td>
																{node[0]}
															</td>
															<td>
																{node[1]}
															</td>
														</tr>
													))}
												</tbody>
											</Table>
											</Table.Container>
									</Tile>
								</Tile>
							</Tile>
							<Tile kind="ancestor" id="map">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Heading subtitle weight="semibold">Storage node map</Heading>
										<Heading subtitle size={6}>
											{`Nodes: `}
											<span>{data.node_map && data.node_map.map((item: NodeMap) => item.nodes).flat().reduce((prev: number, cur: Node) => cur.net === (activeNet === 'mainnet' ? 'main' : 'test') ? prev + cur.value : prev, 0)}</span>
										</Heading>
										<div id="mapcontainer" />
									</Tile>
								</Tile>
							</Tile>
						</Section>
					) : (
						<Section>
							<Tile
								kind="child"
								renderAs={Notification}
								color={"gray"}
							>
								<Heading weight="semibold" subtitle style={{ textAlign: 'center' }}>Something went wrong</Heading>
								<Heading weight="light" subtitle style={{ textAlign: 'center' }}>Contact us at <a href="mailto:info@nspcc.ru" style={{ textDecoration: 'underline' }}>info@nspcc.ru</a></Heading>
							</Tile>
						</Section>
					)}
				</>
			) : (
				<Section>
					<img
						className="custom_loader"
						src="./img/loader.svg"
						height={30}
						width={30}
						alt="loader"
					/>
				</Section>
			)}
		</Container>
  );
}

export default Home;
