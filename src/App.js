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
import {
	MapContainer,
	TileLayer,
	LayersControl,
	Popup,
  Circle,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
										<Heading subtitle>
											{`Network epoch: `}
											<span>{data.network_epoch}</span>
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
										<Heading subtitle>
											{`Containers: `}
											<span>{data.containers}</span>
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
												onClick={() => setActiveNet('mainnet')}
												active={activeNet === 'mainnet'}
											>
												N3 Mainnet
											</Tabs.Tab>
											<Tabs.Tab
												onClick={() => setActiveNet('testnet')}
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
												onClick={() => setActiveNet('mainnet')}
												active={activeNet === 'mainnet'}
											>
												N3 Mainnet
											</Tabs.Tab>
											<Tabs.Tab
												onClick={() => setActiveNet('testnet')}
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
												onClick={() => setActiveNet('mainnet')}
												active={activeNet === 'mainnet'}
											>
												N3 Mainnet
											</Tabs.Tab>
											<Tabs.Tab
												onClick={() => setActiveNet('testnet')}
												active={activeNet === 'testnet'}
											>
												N3 Testnet
											</Tabs.Tab>
										</Tabs>
										<MapContainer
											center={[55, 15]}
											zoom={5}
											style={{
												overflow: 'hidden',
												height: 600,
												borderRadius: 4,
											}}
										>
											<TileLayer
												attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
												url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
											/>
											<LayersControl position="bottomright">
												{data.node_map.map((node) => (node.nodes.map((item) => item.net).indexOf(activeNet === 'mainnet' ? 'main' : 'test') !== -1 && (
													<LayersControl.Overlay checked name={node.location} key={node.location}>
														<Circle
															center={[node.latitude, node.longitude]}
															radius={10000}
															pathOptions={node.nodes.reduce((previousValue, currentValue) => previousValue + Number(currentValue.value), 0) > 1 ? {
																fillColor: 'green',
															} : {
																fillColor: 'red',
															}}
														>
															<Popup>
																<Heading
																	size={6}
																	align="center"
																	style={{ marginBottom: 10 }}
																>
																	{node.location}
																</Heading>
																{node.nodes.map((node_item) => ( node_item.net === (activeNet === 'mainnet' ? 'main' : 'test') && (
																	<Heading
																		key={node_item.net}
																		size={6}
																		align="center"
																		weight="normal"
																		style={{ marginBottom: 5 }}
																	>
																		{`${node_item.net === 'main' ? 'Mainnet' : 'Testnet'}: ${node_item.value} node${node_item.value > 1 ? 's' : ''}`}
																	</Heading>
																)))}
															</Popup>
														</Circle>
													</LayersControl.Overlay>
												)))}
											</LayersControl>
										</MapContainer>
									</Tile>
								</Tile>
							</Tile>
						</Box>
					</Section>
					</Container>
					<Footer
						style={{ padding: '40px 20px' }}
					>
						<Heading
							size={6}
							weight="light"
							subtitle
							align="center"
						>
							NeoFS status monitoring page
						</Heading>
					</Footer>
				</>
			)}
    </>
  );
}
