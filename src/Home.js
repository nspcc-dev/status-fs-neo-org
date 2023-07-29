import { useEffect } from 'react';
import {
	Container,
	Table,
	Section,
	Heading,
	Tile,
	Notification,
} from 'react-bulma-components';
import worldData from './world_data.json';

const Home = ({
	activeNet,
	isError,
	isLoading,
	data,
}) => {
	useEffect(() => {
		if (document.getElementById('mapcontainer')) {
			onInitMap(activeNet);
		}
	},[data]); // eslint-disable-line react-hooks/exhaustive-deps

	const onInitMap = (activeNet) => {
    const width = document.getElementById('mapcontainer').offsetWidth;
		const height = width / 1.5;

		document.getElementById('mapcontainer').innerHTML = '';

		const projection = window.d3
			.geo
			.mercator()
			.translate([(width / 2), (height / 1.4)])
			.scale(width / 2 / Math.PI);
		const path = window.d3
			.geo
			.path()
			.projection(projection);
		const svg = window.d3
			.select("#mapcontainer")
			.append("svg")
			.attr("width", width)
			.attr("height", height + 8)
			.append("g");
		const g = svg
			.append("g");

		const net = activeNet === 'mainnet' ? 'main' : 'test';
		const world = JSON.parse(worldData.content);
		const countries = window.topojson.feature(world, world.objects.countries).features;
		const country = g.selectAll(".country").data(countries);
		country
			.enter()
			.insert("path")
			.attr("class", "country")
			.attr("d", path)
			.attr("id", (d) => d.id)
			.style("fill", '#49cc90');

			const tip = window.d3
				.select("body")
				.append("div");
			g.selectAll("circle")
				.data(data.node_map.filter(item => item.nodes.map((node) => node.net).indexOf(net) !== -1))
				.enter()
				.append("circle")
				.attr("class", "mapcircle")
				.attr("cx", (d) => projection([d.longitude, d.latitude])[0])
				.attr("cy", (d) => projection([d.longitude, d.latitude])[1])
				.attr("r", "7")
				.on("mouseover", (d) => {
					const circ = window.d3.select(this);
					circ.attr("class", "mouseover mapcircle");
					tip.html(`
						<div class='title is-6' style='margin-bottom: 10px'>${d.location}</div>
						<div>${activeNet === 'mainnet' ? 'Mainnet' : 'Testnet'}: ${d.nodes.filter((item) => item.net === net)[0].value} node${d.nodes.filter((item) => item.net === net)[0].value > 1 ? 's' : ''}</div>
					`);
					tip.transition()
						.attr("class", "tooltip")
						.style("display", "block");
					tip.style("left", window.d3.event.pageX + 5 + "px")
						.style("top", window.d3.event.pageY - 25 + "px");
				})
				.on("mouseout", () => {
					const circ=window.d3.select(this);
					circ.attr("class", "mouseout mapcircle");
					tip.transition()
						.style("display", "none");
				});
	};

  const getColorStatus = (status) => {
		let color = 'success';
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

	function checkRelevanceData() {
		const currentTimestamp = new Date().getTime();
		const dataTimeMs = data.time * 1000;
		const timeRelevance = 2 * 300000; // new data generate each 300000 ms, check for double missing data time
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
								{data.statusmsg && ((activeNet === 'mainnet' && data.statusmsg[activeNet]) || (activeNet === 'testnet' && data.statusmsg[activeNet])) && (
									<Heading subtitle size={6}>{data.statusmsg[activeNet]}</Heading>
								)}
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
											<span>{`Hash script: `}</span>
											{data.contract && data.contract[activeNet].script_hash}
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
													{data.storage_nodes && data.storage_nodes[activeNet].map((node) => (
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
													{data.neo_go_rpc_nodes && data.neo_go_rpc_nodes[activeNet].map((node) => (
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
													{data.side_chain_rpc_nodes && data.side_chain_rpc_nodes[activeNet].map((node) => (
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
											<span>{data.node_map && data.node_map.map((item) => item.nodes).flat().reduce((prev, cur) => cur.net === (activeNet === 'mainnet' ? 'main' : 'test') ? prev + Number(cur.value) : prev, 0)}</span>
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
								<Heading weight="semibold" subtitle align="center">Something went wrong</Heading>
								<Heading weight="light" subtitle align="center">Contact us at <a href="mailto:info@nspcc.ru" style={{ textDecoration: 'underline' }}>info@nspcc.ru</a></Heading>
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
