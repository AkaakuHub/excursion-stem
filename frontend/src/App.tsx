import React from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import GamePage from "./pages/GamePage";
import HomePage from "./pages/HomePage";
import "./styles.css";

export default function App() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
			<Header />
			<main className="container mx-auto p-4 pt-8">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/game" element={<GamePage />} />
				</Routes>
			</main>
		</div>
	);
}
