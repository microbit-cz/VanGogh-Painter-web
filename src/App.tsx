import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {Welcome} from "./pages/Welcome.tsx";
import {AboutUs} from "./pages/AboutUs.tsx";
import {UploadPage} from "./pages/UploadPage.tsx";
import {Painter} from "./pages/Painter.tsx";
import {EditorPage} from "./pages/Editor.tsx";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                <Route path="/" element={<Welcome />} />
                <Route path="/AboutUs" element={<AboutUs />} />
                <Route path="/Upload" element={<UploadPage />} />
                <Route path="/Painter" element={<Painter />} />
                <Route path="/Editor" element={<EditorPage />} />
                <Route path={"*"} element={<div>404 Not Found</div>} />
            </>
        ), {basename: "/"}
    )

    return (
        <RouterProvider router={router} />
    )
}

export default App