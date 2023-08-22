import { useEffect, useState } from 'react';
import { Link, Route, Routes, Navigate, useLocation } from "react-router-dom";
import 'bulma/css/bulma.min.css';
import {
	Navbar,
	Heading,
	Footer,
} from 'react-bulma-components';
import Home from './Home';
import NotFound from './NotFound';
import './App.css';


export const App = () => {
	const location = useLocation();
	const [isError, setError] = useState(false);
	const [isLoading, setLoading] = useState(true);
	const [menuActive, setMenuActive] = useState(false);
	const [data, setData] = useState();

  useEffect(() => {
		try {
			fetch('output.json', {
				'headers' : {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				}
			}).then((response) => response.json()).then((myJson) => {
				setLoading(false);
				setData(myJson);
			}).catch(() => {
				setLoading(false);
				setError(true);
			});
		} catch (err) {
			setLoading(false);
			setError(true);
		}
  },[]);

  return (
    <>
			<Navbar>
				<Navbar.Brand>
					<Navbar.Item renderAs="div">
						<img src="./img/logo.svg" height="28" width="112" alt="logo"/>
					</Navbar.Item>
					{!isLoading && !isError && data && (
						<Navbar.Burger
							className={menuActive ? 'is-active' : ''}
							onClick={() => setMenuActive(!menuActive)}
						/>
					)}
				</Navbar.Brand>
				{!isLoading && !isError && data && (
					<Navbar.Menu
						className={menuActive ? 'is-active' : ''}
					>
						<Navbar.Container>
							<Link
								to="/"
								className="navbar-item"
								onClick={() => setMenuActive(false)}
							>
								Mainnet
							</Link>
							<Link
								to="/testnet"
								className="navbar-item"
								onClick={() => setMenuActive(false)}
							>
								Testnet
							</Link>
						</Navbar.Container>
						<Navbar.Container align="right">
							<Navbar.Item renderAs="div" style={{ fontSize: 14 }}>
								{data ? `${new Date(data.time * 1000).toLocaleTimeString()} ${new Date(data.time * 1000).toLocaleDateString()}` : ''}
							</Navbar.Item>
						</Navbar.Container>
					</Navbar.Menu>
				)}
			</Navbar>
			<main style={{ minHeight: 'calc(100vh - 231.8px)' }}>
				<Routes>
					<Route
						path="/"
						element={<Home
							activeNet="mainnet"
							location={location}
							isError={isError}
							isLoading={isLoading}
							data={data}
						/>}
					/>
					<Route
						path="/testnet"
						element={<Home
							activeNet="testnet"
							location={location}
							isError={isError}
							isLoading={isLoading}
							data={data}
						/>}
					/>
					<Route
						path="/mainnet"
						element={<Navigate to="/" replace />}
					/>
					<Route
						path="*"
						element={<NotFound />}
					/>
				</Routes>
			</main>
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
					<span class="social_pipe">
						<a href="https://nspcc.ru/en" target="_blank" rel="noopener noreferrer">
							<img
								src="./img/socials/neo_spcc.svg"
								width={37}
								height={37}
								alt="neo spcc logo"
							/>
						</a>
					</span>
					<a href="https://github.com/nspcc-dev" target="_blank" rel="noopener noreferrer" style={{ paddingLeft: 10 }}>
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
					<a href="https://www.youtube.com/@NeoSPCC" target="_blank" rel="noopener noreferrer">
						<img
							src="./img/socials/youtube.svg"
							width={30}
							height={30}
							alt="youtube logo"
						/>
					</a>
					<a href="https://neospcc.medium.com/" target="_blank" rel="noopener noreferrer">
						<img
							src="./img/socials/medium.svg"
							width={30}
							height={30}
							alt="medium logo"
						/>
					</a>
				</div>
				<Heading
					size={6}
					weight="light"
					subtitle
					align="center"
					style={{ marginBottom: '0.3rem' }}
				>
					NeoFS status monitoring page
				</Heading>
				<Heading
					size={7}
					weight="light"
					subtitle
					align="center"
				>
					{process.env.REACT_APP_VERSION}
				</Heading>
			</Footer>
    </>
  );
}
