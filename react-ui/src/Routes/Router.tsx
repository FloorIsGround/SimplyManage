import { createBrowserRouter } from "react-router";
import App from "../App";
import HoursLocations from "../Components/Header/HoursLocations";
import SignUp from "../Components/SignUp/SignUp";
import Faqs from "../Components/Faqs";
import Homepage from "../Components/Homepage/Homepage";
import PatronDashboard from "../Components/Dashboard/PatronDashboard";
import StaffDashboard from "../Components/Dashboard/StaffDashboard";

// Main router
export const Router = createBrowserRouter([
    {
        // Root layout. App acts as the parent wrapper for all nested routes
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
            },
            {
                path: "/patron-dashboard",
                element: <PatronDashboard />
            }
        ]
    },
    {
        path: "/staff-dashboard",
        element: <StaffDashboard />
    }
])