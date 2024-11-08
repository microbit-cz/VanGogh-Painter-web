/*
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {Welcome} from "./pages/Welcome.tsx";
import {AboutUs} from "./pages/AboutUs.tsx";
import {Painter} from "./pages/Painter.tsx";
*/
//import {Header} from "./components/Header.tsx";

import {ScaleSetting} from "./components/ScaleSetting.tsx";

function App() {
    /*
    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                <Route path="/" element={<Welcome />} />
                <Route path="/AboutUs" element={<AboutUs />} />
                <Route path="/Painter" element={<Painter />} />
            </>
        ), {basename: "/MP2024-25_Holy-Jan_VanGogh-Painter"}
    )
    */

    return (
        //<RouterProvider router={router} />
        <>
            <ScaleSetting />
        </>
    )
}

export default App