import Styles from "./Header.module.css";
//import {Link} from "react-router-dom";


export const Header = () => {
    return (
        <header>
            <a className={Styles["header__title"]} href={"/Welcome"}>VanGogh Painter</a>
            <a className={"btn"} href={"/AboutUs"}>About Us</a>
        </header>
    );
};