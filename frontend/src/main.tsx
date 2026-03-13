// The entry point of the entire React app.
// This is the first file that runs when the app starts.

// createRoot is React 18's way of mounting the app to the DOM
import { createRoot } from "react-dom/client";

// The root App component that wraps everything
import App from "./app/App.tsx";

// The main CSS entry point — pulls in fonts, tailwind, and theme
import "./index.css";

// Finds the <div id="root"> in index.html and mounts the React app inside it
// The ! tells TypeScript "this element definitely exists"
createRoot(document.getElementById("root")!).render(<App />);