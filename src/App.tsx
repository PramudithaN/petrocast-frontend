import { Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Dashboard from "./components/Dashboard";
import News from "./components/News";
import PerformanceMonitor from "./components/PerformanceMonitor";
import Footer from "./components/Footer";
import { NotificationProvider } from "./context/NotificationContext";
import { DateConfigProvider } from "./context/DateConfigContext";

function App() {
  const oilTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: "#F59E0B",
      colorBgBase: "#0e0c0a",
      colorBgContainer: "#191713",
      colorBorder: "#2b2824",
      colorText: "#e5e7eb",
      fontFamily: "Inter, sans-serif",
      borderRadius: 12,
    },
    components: {
      Card: {
        colorBgContainer: "rgba(33, 31, 27, 0.6)",
        colorBorderSecondary: "rgba(255, 255, 255, 0.08)",
      },
      Table: {
        colorBgContainer: "transparent",
        headerBg: "rgba(255, 255, 255, 0.03)",
      },
    },
  };

  return (
    <ConfigProvider theme={oilTheme}>
      <DateConfigProvider locale="en-US">
        <NotificationProvider>
          <div className="min-h-screen bg-oil-black text-gray-200 selection:bg-oil-gold/30 selection:text-white overflow-x-hidden">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/news" element={<News />} />
                <Route path="/about" element={<About />} />
                <Route path="/performance" element={<PerformanceMonitor />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </DateConfigProvider>
    </ConfigProvider>
  );
}

export default App;
