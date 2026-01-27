import { createBrowserRouter } from "react-router";
import App from "../App";

export const Router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    }
])