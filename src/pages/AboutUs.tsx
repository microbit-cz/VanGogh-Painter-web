import {FC} from "react";
import {Header} from "../components/Header.tsx";
import Styles from "./AboutUs.module.css";
import {Footer} from "../components/Footer.tsx";
import VGpainter1 from "../img/VGpainter1-DS.jpg";
import VGpainter2 from "../img/VGpainter2-DS.jpg";
import VGpainter3 from "../img/VGpainter3-DS.jpg";
import VGpainter4 from "../img/VGpainter4-DS.jpg";
import VGpainter5 from "../img/VGpainter5-DS.jpg";
import VGpainter6 from "../img/VGpainter6-DS.jpg";

export const AboutUs: FC = () => {
    return (
        <>
            <Header />
            <main className={Styles["aboutUs__page"]}>
                <article className={Styles["aboutUs__article"]}>
                    <h1 className={Styles["aboutUs__title"]}>What is VanGogh Painter?</h1>
                    <section>
                        <p className={Styles["aboutUs__text"]}>We are passionate about merging technology and creativity to inspire learning and innovation. Our project, VanGogh, embodies this mission by transforming the BBC micro:bit into a drawing robot that brings digital designs to life.</p>
                    </section>
                    <section>
                        <p className={Styles["aboutUs__text"]}>VanGogh is a 3D-printed vehicle equipped with a micro:bit microcontroller, servos, and stepper motors, enabling it to draw images based on turtle graphics commands. To enhance its capabilities, we've developed the VanGogh Extension Library, which provides functions for calibration, movement control, and drawing different shapes.</p>
                    </section>
                    <section>
                        <p className={Styles["aboutUs__text"]}>To bridge the gap between digital art and physical drawing, our VanGogh SVG Converter translates SVG path drawings into turtle graphics commands that VanGogh can execute with ease.</p>
                    </section>
                    <section>
                        <p className={Styles["aboutUs__text"]}>Through this project, we aim to empower individuals to explore the intersection of coding and robotics, fostering a hands-on learning experience that is both educational and enjoyable.</p>
                    </section>
                </article>
                <div className={Styles["aboutUs__imgContainer"]}>
                    <img className={Styles["aboutUs__img"]} src={VGpainter1} alt={"VanGogh Painter"}/>
                    <img className={Styles["aboutUs__img"]} src={VGpainter2} alt={"VanGogh Painter"}/>
                    <img className={Styles["aboutUs__img"]} src={VGpainter3} alt={"VanGogh Painter"}/>
                    <img className={Styles["aboutUs__img"]} src={VGpainter4} alt={"VanGogh Painter"}/>
                    <img className={Styles["aboutUs__img"]} src={VGpainter5} alt={"VanGogh Painter"}/>
                    <img className={Styles["aboutUs__img"]} src={VGpainter6} alt={"VanGogh Painter"}/>
                </div>
            </main>
            <Footer/>
        </>
    )
}