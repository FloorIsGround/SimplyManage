import { createBrowserRouter } from "react-router";
import App from "../App";
import HoursLocations from "../Components/Header/HoursLocations";
import SignUp from "../Components/SignUp/SignUp";
import Faqs from "../Components/Faqs";
import Homepage from "../Components/Homepage/Homepage";
import PatronDashboard from "../Components/Dashboard/PatronDashboard/PatronDashboard";
import LibrariesPage from "../Components/Dashboard/StaffDashboard/NavigationPages/LibrariesPage";
import UsersPage from "../Components/Dashboard/StaffDashboard/NavigationPages/UsersPage";
import DashboardPage from "../Components/Dashboard/StaffDashboard/NavigationPages/DashboardPage";
import BooksPage from "../Components/Dashboard/StaffDashboard/NavigationPages/BooksPage";
import ContactUs from "../Components/Footer/ContactUs";

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
            },
            {
                path: "/contact",
                element: <ContactUs />
            },
            {
                path: "/privacy",
                element: <PrivacyPolicy />
            },
        ]
    },
    {
        path: "/staff-dashboard",
        element: <DashboardPage />
    },
    {
        path: "/staff-dashboard/books",
        element: <BooksPage />
    },
    {
        path: "/staff-dashboard/libraries",
        element: <LibrariesPage />
    },
    {
        path: "/staff-dashboard/users",
        element: <UsersPage />
    },
])