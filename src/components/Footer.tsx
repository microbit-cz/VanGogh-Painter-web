import {Icon, IconVariant} from "./Icon.tsx";
import Styles from "./Footer.module.css";
import {Link} from "react-router-dom";
import {FC} from "react";

export const Footer: FC = () => {
    return (
        <footer>
            <a className={Styles["footer__icon"]} href={"https://github.com/pslib-cz/MP2024-25_Holy-Jan_VanGogh-Painter"}><Icon variant={IconVariant.GITHUB} /></a>
            <div className={Styles["footer__linkContainer"]}>
                <Link className={Styles["footer__link"]} to={"/"}>Home</Link>
                <Link className={Styles["footer__link"]} to={"/AboutUs"}>About Us</Link>
            </div>
            <p className={Styles["footer_copy"]}>©2025 VanGogh Painter</p>
        </footer>
    );
};