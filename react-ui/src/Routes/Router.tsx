import { createBrowserRouter } from "react-router";
import App from "../App";
import HoursLocations from "../Components/HoursLocations";
import SignUp from "../Components/SignUp";
import Faqs from "../Components/Faqs";

export const Router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/hours-locations",
                element: <HoursLocations />
            },
            {
                path: "/sign-up",
                element: <SignUp />
            },
            {
                path: "/faqs",
                element: <Faqs />
            }
        ]
    }
])