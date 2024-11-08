import Styles from "./Header.module.css";
import {Link} from "react-router-dom";


export const Header = () => {
    return (
        <header>
            <Link className={Styles["header__title"]} to={"/Welcome"}>VanGogh Painter</Link>
            <Link className={"btn"} to={"/AboutUs"}>About Us</Link>
        </header>
    );
};