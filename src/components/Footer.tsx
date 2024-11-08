import {Icon, IconVariant} from "./Icon.tsx";
import Styles from "./Footer.module.css";

export const Footer = () => {
    return (
        <footer>
            <a className={Styles["footer__icon"]} href={"https://github.com/pslib-cz/MP2024-25_Holy-Jan_VanGogh-Painter"}><Icon variant={IconVariant.GITHUB} /></a>
            <div className={Styles["footer__linkContainer"]}>
                <a className={Styles["footer__link"]} href={"/Welcome"}>Home</a>
                <a className={Styles["footer__link"]} href={"/AboutUs"}>About Us</a>
            </div>
            <p className={Styles["footer_copy"]}>©2025 VanGogh Painter</p>
        </footer>
    );
};