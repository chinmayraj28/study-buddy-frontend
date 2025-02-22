import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);

        if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            return false;
        }

        return true;
    } catch (error) {
        console.log("Invalid token");
        localStorage.removeItem("token");
        return false;
    }
};

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
