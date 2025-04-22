import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {AboutUs} from "./pages/AboutUs.tsx";
import {Painter} from "./pages/Painter.tsx";
import {EditorPage} from "./pages/Editor.tsx";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                <Route path="/" element={<Painter />} />
                <Route path="/AboutUs" element={<AboutUs />} />
                <Route path="/Editor" element={<EditorPage />} />
                <Route path={"*"} element={<div>404 Not Found</div>} />
            </>
        ), {basename: "/VanGogh-Painter-web/"}
    )

    return (
        <RouterProvider router={router} />
    )
}

export default App