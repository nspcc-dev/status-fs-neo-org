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
} from 'react-bulma-components';
import {
	MapContainer,
	TileLayer,
	LayerGroup,
	Popup,
  Circle,
} from 'react-leaflet';
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
	const [menuActive, setMenuActive] = useState(false);
	const [chartData, setChartData] = useState({
		labels: ['00:01', '00:02', '00:03', '00:04', '00:05'],
		datasets: [{
			label: 'Test',
			data: [1, 0, 1, 1, 5],
		}],
	});

  const onScroll = (event, block) => {
    const scrollDiv = document.getElementById(block).offsetTop + 30;
    window.scrollTo({ top: scrollDiv, behavior: 'smooth'});
		event.preventDefault();
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
							10:00:00 18.05.2022
						</Navbar.Item>
					</Navbar.Container>
				</Navbar.Menu>
			</Navbar>
			<Container>
				<Section>
					<Tile
						kind="child"
						renderAs={Notification}
						color="success"
					>
						<Heading>Status: Healthy</Heading>
					</Tile>
					<Box style={{ marginTop: '1.5rem' }} id="main">
						<Tile kind="ancestor">
							<Tile kind="parent">
								<Tile
									kind="child"
									renderAs={Notification}
									color="grey"
								>
									<Heading subtitle>Network epoch</Heading>
								</Tile>
							</Tile>
							<Tile kind="parent">
								<Tile
									kind="child"
									renderAs={Notification}
									color="grey"
								>
									<Heading subtitle>Containers</Heading>
									<Chart
										type='line'
										data={chartData}
									/>
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
									<Heading subtitle>Sidechain endpoints</Heading>
								</Tile>
							</Tile>
							<Tile kind="parent">
								<Tile
									kind="child"
									renderAs={Notification}
									color="grey"
								>
									<Heading subtitle>Side chain RPC nodes</Heading>
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
									<Heading subtitle size={6}>address NadZ8YfvkddivcFFkztZgfwxZyKf1acpRF | hash script b65d8243ac63983206d17e5221af0653a7266fa1</Heading>
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
									<MapContainer
										center={[50, 20]}
										zoom={3}
										style={{ overflow: 'hidden', height: 600 }}
									>
										<TileLayer
											attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
											url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
										/>
										<LayerGroup>
											<Circle center={[51.505, -0.09]} pathOptions={{ fillColor: 'red' }} >
												<Popup>
													Saint-Petersburg
												</Popup>
											</Circle>
										</LayerGroup>
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
				>Morphbits status monitoring page</Heading>
			</Footer>
    </>
  );
}
