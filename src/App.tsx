import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, Navigate, useLocation } from "react-router-dom";
import {
	Navbar,
	Heading,
	Footer,
} from 'react-bulma-components';
import Home from './Home.tsx';
import NotFound from './NotFound.tsx';
import 'bulma/css/bulma.min.css';
import './App.css';

export interface Data {
	"status": {
		"mainnet": string
		"testnet": string
	}
	"statusmsgs": {
		"mainnet": string[]
		"testnet": string[]
	}
	"network_epoch": {
		"mainnet": number | string
		"testnet": number | string
	}
	"containers": {
		"mainnet": number | string
		"testnet": number | string
	}
	"time": number
	"gateways": {
		"mainnet": string[][]
		"testnet": string[][]
	}
	"node_map": NodeMap[]
	"contract": {
		"mainnet": {
			"address": string
			"script_hash": string
		}
		"testnet": {
			"address": string
			"script_hash": string
		}
	}
	"side_chain_rpc_nodes": {
		"mainnet": string[][]
		"testnet": string[][]
	}
	"storage_nodes": {
		"mainnet": string[][]
		"testnet": string[][]
	}
	"neo_go_rpc_nodes": {
		"mainnet": string[][]
		"testnet": string[][]
	}
}

export interface NodeMap {
	"latitude": string
	"location": string
	"longitude": string
	"nodes": Node[]
}

export interface Node {
	"net": string
	"value": number
}

export const App = () => {
	const location: any = useLocation();
	const [isError, setError] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [menuActive, setMenuActive] = useState<boolean>(false);
	const [data, setData] = useState<Data>();

  useEffect(() => {
		try {
			fetch('output.json', {
				'headers' : {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				}
			}).then((response) => response.json()).then((myJson: Data) => {
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
					<span className="social_pipe">
						<a href="https://nspcc.io/" target="_blank" rel="noopener noreferrer">
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
					style={{ marginBottom: '0.3rem', textAlign: 'center' }}
				>
					NeoFS status monitoring page
				</Heading>
				<Heading
					weight="light"
					subtitle
					style={{ textAlign: 'center', fontSize: '.75rem' }}
				>
					{process.env.REACT_APP_VERSION}
				</Heading>
			</Footer>
    </>
  );
}
