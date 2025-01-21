import {FC} from "react";
import {Upload} from "../components/Upload.tsx";
import {Header} from "../components/Header.tsx";

export const UploadPage: FC = () => {
    return (
        <>
            <Header />
            <main>
                <Upload />
            </main>
        </>
    )
}