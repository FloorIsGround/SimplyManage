import { createBrowserRouter } from "react-router";
import App from "../App";
import HoursLocations from "../Components/HoursLocations";
import SignUp from "../Components/SignUp";
import Faqs from "../Components/Faqs";
import Homepage from "../Components/Homepage";

// Main application router configuration.
//  This defines all navigable paths in the app and which component should render for each. 
export const Router = createBrowserRouter([
    {
        // Root layout — App acts as the parent wrapper for all nested routes
        path: "/",
        element: <App />,
        
        // Child routes render inside <Outlet /> within App
        children: [
            {
                index: true,
                element: <Homepage />
            },
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