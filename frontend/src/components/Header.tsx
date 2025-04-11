import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
	return (
		<header className="bg-indigo-600 shadow-md">
			<div className="container mx-auto px-4 py-3 flex justify-between items-center">
				<Link to="/" className="text-white text-xl font-bold flex items-center">
					<svg
						className="w-6 h-6 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>音楽パート分けゲーム</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
						/>
					</svg>
					音楽パート分けゲーム
				</Link>

				<nav>
					<ul className="flex space-x-6">
						<li>
							<Link
								to="/"
								className="text-white hover:text-indigo-200 transition-colors"
							>
								ホーム
							</Link>
						</li>
						<li>
							<Link
								to="/game"
								className="text-white hover:text-indigo-200 transition-colors"
							>
								ゲーム
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</header>
	);
}
