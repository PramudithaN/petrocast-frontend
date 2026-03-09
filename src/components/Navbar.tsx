import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Home, Info, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import AnimatedButton from "./ui/AnimatedButton";

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { title: "Home", path: "/", icon: <Home size={18} /> },
    { title: "Dashboard", path: "/dashboard", icon: <AreaChart size={18} /> },
    { title: "About", path: "/about", icon: <Info size={18} /> },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-strong shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-oil-gold to-oil-amber flex items-center justify-center shadow-lg shadow-oil-gold/20 group-hover:shadow-oil-gold/40 transition-shadow"
            >
              <span className="text-oil-black font-bold text-base font-display">
                O
              </span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-oil-gold to-oil-amber opacity-0 group-hover:opacity-100 animate-pulse-glow transition-opacity" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-bold font-display text-gradient-gold leading-tight">
                PetroCast
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                AI Forecast
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1.5"
                  style={{ color: isActive ? "#F59E0B" : "#9CA3AF" }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-oil-gold/10 rounded-xl border border-oil-gold/20"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-white">
                    {item.icon}
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link to="/dashboard">
              <AnimatedButton
                variant="primary"
                hoverScale={1.03}
                className="px-4 py-2 text-xs rounded-xl shadow-lg shadow-oil-gold/20 hover:shadow-oil-gold/40 whitespace-nowrap"
              >
                <AreaChart size={16} />
                Live Forecast
              </AnimatedButton>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 glass-strong z-50 md:hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-display text-gradient-gold">
                    PetroCast
                  </span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-4 flex-1">
                {navItems.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                          isActive
                            ? "bg-oil-gold/10 text-oil-gold border border-oil-gold/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-white/5">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-5 py-3 bg-gradient-to-r from-oil-gold to-oil-amber text-oil-black font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                    <AreaChart size={16} />
                    Live Forecast
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
