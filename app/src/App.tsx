import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { MapPage } from "./pages/MapPage";
import { AboutPage } from "./pages/AboutPage";
import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <div className="h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
