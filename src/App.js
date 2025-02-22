import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Mainpage from "./components/Mainpage";
import Intro from "./components/Intro";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPass from "./components/ForgotPass";
import Logout from "./components/Logout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Mainpage />
            </PrivateRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>    
  );
}

export default App;
