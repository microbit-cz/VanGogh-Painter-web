import Styles from "./Header.module.css";
import {Link} from "react-router-dom";
import {FC} from "react";


export const Header: FC = () => {
    return (
        <header>
            <Link className={Styles["header__title"]} to={"/"}>VanGogh Painter</Link>
            <Link className={"btn"} to={"/AboutUs"}>About Us</Link>
        </header>
    );
};