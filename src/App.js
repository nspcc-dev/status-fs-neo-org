import { useEffect, useState } from 'react';
import 'bulma/css/bulma.min.css';
import {
	Navbar,
	Container,
	Section,
	Box,
	Heading,
	Tile,
	Footer,
	Notification,
	Table,
	Tabs,
} from 'react-bulma-components';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export const App = () => {
	const [activeNet, setActiveNet] = useState('mainnet');
	const [menuActive, setMenuActive] = useState(false);
	const [data, setData]=useState();

	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [{
			label: 'Containers',
			data: [],
		}],
	});

  useEffect(()=>{
    fetch('output.json', {
			'headers' : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
       }
    }).then((response) => response.json()).then((myJson) => {
			setData(myJson);
		});
  },[]);

	useEffect(() => {
		if (document.getElementById('mapcontainer')) {
			onInitMap(activeNet);
		}
	},[data]); // eslint-disable-line react-hooks/exhaustive-deps

	const onInitMap = (activeNet) => {
		document.getElementById('mapcontainer').innerHTML = '';
    const width = document.getElementById('mapcontainer').offsetWidth;
		const height = width / 1.5;

		const projection = window.d3
			.geo
			.mercator()
			.translate([(width / 4.5), (height * 2.2)])
			.scale(width * 3 / Math.PI);
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
		window.d3.json("https://api.github.com/gists/9398333", (error, root) => {
			let world = JSON.parse(root.files['world.json'].content);
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
		});
	};

  const onScroll = (event, block) => {
    const scrollDiv = document.getElementById(block).offsetTop + 30;
    window.scrollTo({ top: scrollDiv, behavior: 'smooth'});
		setMenuActive(false);
		event.preventDefault();
	};

  const getColorStatus = (status) => {
		let color = 'success';
		if (status === 'Healthy') {
			color = 'success';
		} else if (status === 'Maintenance') {
			color = 'warning';
		} else if (status === 'Degraded') {
			color = 'danger';
		}
    return color;
	};

  return (
    <>
			<Navbar style={{ background: "#2b393f" }}>
				<Navbar.Brand>
					<Navbar.Item renderAs="div">
						<img src="./img/logo.svg" height="28" width="112" alt="logo"/>
					</Navbar.Item>
					<Navbar.Burger
						className={menuActive ? 'is-active' : ''}
						onClick={() => setMenuActive(!menuActive)}
					/>
				</Navbar.Brand>
				<Navbar.Menu
					className={menuActive ? 'is-active' : ''}
				>
					<Navbar.Container>
						<Navbar.Item href="#main" onClick={(e) => onScroll(e, 'main')}>
							Main
						</Navbar.Item>
						<Navbar.Item href="#map" onClick={(e) => onScroll(e, 'map')}>
							Node map
						</Navbar.Item>
					</Navbar.Container>
					<Navbar.Container align="right">
						<Navbar.Item renderAs="div" style={{ fontSize: 14 }}>
							{data ? `${new Date(data.time * 1000).toLocaleTimeString()} ${new Date(data.time * 1000).toLocaleDateString()}` : ''}
						</Navbar.Item>
					</Navbar.Container>
				</Navbar.Menu>
			</Navbar>
			{data && (
				<>
					<Container>
					<Section>
						<Tile
							kind="child"
							renderAs={Notification}
							color={getColorStatus(data.status)}
						>
							<Heading>{`Status: ${data.status}`}</Heading>
						</Tile>
						<Box style={{ marginTop: '1.5rem' }} id="main">
							<Tile kind="ancestor">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Tabs>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('mainnet');
													onInitMap('mainnet');
												}}
												active={activeNet === 'mainnet'}
											>
												N3 Mainnet
											</Tabs.Tab>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('testnet');
													onInitMap('testnet');
												}}
												active={activeNet === 'testnet'}
											>
												N3 Testnet
											</Tabs.Tab>
										</Tabs>
										<Heading subtitle>
											{`Network epoch: `}
											<span>{data.network_epoch[activeNet]}</span>
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
										<Tabs>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('mainnet');
													onInitMap('mainnet');
												}}
												active={activeNet === 'mainnet'}
											>
												N3 Mainnet
											</Tabs.Tab>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('testnet');
													onInitMap('testnet');
												}}
												active={activeNet === 'testnet'}
											>
												N3 Testnet
											</Tabs.Tab>
										</Tabs>
										<Heading subtitle>
											{`Containers: `}
											<span>{data.containers[activeNet]}</span>
										</Heading>
										{/* <Chart
											type='line'
											data={chartData}
										/> */}
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
										<Heading subtitle>Side chain RPC nodes</Heading>
										<Tabs>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('mainnet');
													onInitMap('mainnet');
												}}
												active={activeNet === 'mainnet'}
											>
												N3 Mainnet
											</Tabs.Tab>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('testnet');
													onInitMap('testnet');
												}}
												active={activeNet === 'testnet'}
											>
												N3 Testnet
											</Tabs.Tab>
										</Tabs>
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
													{data.side_chain_rpc_nodes[activeNet].map((node) => (
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
						</Box>
						<Box>
							<Tile kind="ancestor">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Heading subtitle>NeoFS deposit</Heading>
										<Tabs>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('mainnet');
													onInitMap('mainnet');
												}}
												active={activeNet === 'mainnet'}
											>
												N3 Mainnet
											</Tabs.Tab>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('testnet');
													onInitMap('testnet');
												}}
												active={activeNet === 'testnet'}
											>
												N3 Testnet
											</Tabs.Tab>
										</Tabs>
										<Heading subtitle size={6}>
											<span>{`Address `}</span>
											{data.contract[activeNet].address}
										</Heading>
										<Heading subtitle size={6}>
											<span>{`Hash script `}</span>
											{data.contract[activeNet].script_hash}
										</Heading>
									</Tile>
								</Tile>
							</Tile>
						</Box>
						<Box id="map">
							<Tile kind="ancestor">
								<Tile kind="parent">
									<Tile
										kind="child"
										renderAs={Notification}
										color="grey"
									>
										<Heading subtitle>Storage node map</Heading>
										<Tabs>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('mainnet');
													onInitMap('mainnet');
												}}
												active={activeNet === 'mainnet'}
											>
												N3 Mainnet
											</Tabs.Tab>
											<Tabs.Tab
												onClick={() => {
													setActiveNet('testnet');
													onInitMap('testnet');
												}}
												active={activeNet === 'testnet'}
											>
												N3 Testnet
											</Tabs.Tab>
										</Tabs>
										<div id="mapcontainer" />
									</Tile>
								</Tile>
							</Tile>
						</Box>
					</Section>
					</Container>
					<Footer
						style={{ padding: '40px 20px' }}
					>
						<div className="socials">
							<a href="https://neo.org/" target="_blank" rel="noopener noreferrer">
								<img
									src="./img/socials/neo.svg"
									width={26}
									height={26}
									style={{ filter: 'invert(1)' }}
									alt="neo logo"
								/>
							</a>
							<a href="https://nspcc.ru/en" target="_blank" rel="noopener noreferrer" style={{ borderRight: '2px solid #000000', paddingRight: 20 }}>
								<img
									src="./img/socials/neo_spcc.svg"
									width={37}
									height={37}
									alt="neo spcc logo"
								/>
							</a>
							<a href="https://github.com/nspcc-dev" target="_blank" rel="noopener noreferrer">
								<img
									src="./img/socials/github.svg"
									width={30}
									height={30}
									alt="github logo"
								/>
							</a>
							<a href="https://twitter.com/neospcc" target="_blank" rel="noopener noreferrer">
								<img
									src="./img/socials/twitter.svg"
									width={30}
									height={30}
									alt="twitter logo"
								/>
							</a>
							<a href="https://www.youtube.com/channel/UCAC6lR1bJFv0-O07Nol_p8w" target="_blank" rel="noopener noreferrer">
								<img
									src="./img/socials/youtube.svg"
									width={30}
									height={30}
									alt="youtube logo"
								/>
							</a>
						</div>
						<Heading
							size={6}
							weight="light"
							subtitle
							align="center"
						>
							2022 © NeoFS status monitoring page
						</Heading>
					</Footer>
				</>
			)}
    </>
  );
}
