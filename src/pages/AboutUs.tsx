import {FC} from "react";
import {Header} from "../components/Header.tsx";
import Styles from "./AboutUs.module.css";
import {Footer} from "../components/Footer.tsx";

export const AboutUs: FC = () => {

    return (
        <>
            <Header />
            <main>
                <article className={Styles["aboutUs__article"]}>
                    <h1 className={Styles["aboutUs__title"]}>What is VanGogh Painter?</h1>
                    <section>
                        <p className={Styles["aboutUs__text"]}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eu sapien enim. Ut eu convallis erat. Sed at leo a dui viverra rhoncus a nec massa. Donec eget nisi ut neque pulvinar condimentum. Donec eu ex nec mi mollis efficitur non eget tellus. Nullam semper hendrerit urna, vel imperdiet ipsum pulvinar non. Morbi sed dui vestibulum, porta nisl vitae, aliquet arcu. Etiam sit amet risus non metus pulvinar scelerisque. Vestibulum tellus lectus, euismod vel mi finibus, vehicula viverra elit.</p>
                    </section>
                    <section>
                        <p className={Styles["aboutUs__text"]}>Suspendisse ut iaculis ante. Duis eleifend turpis eu nisi efficitur, nec ultrices nunc sagittis. Suspendisse eleifend sit amet eros id accumsan. Sed ac egestas velit, et luctus elit. Maecenas risus lectus, pellentesque sed suscipit nec, tempor in nisi. Aenean ornare lectus id hendrerit pharetra. Morbi tempus auctor imperdiet. Vivamus nibh enim, faucibus a rhoncus non, vehicula finibus elit. Curabitur vel dui fermentum, semper eros quis, fringilla turpis.</p>
                    </section>
                    <section>
                        <p className={Styles["aboutUs__text"]}>Phasellus tempor ex quis metus dapibus ornare. Sed nec libero rhoncus, luctus tellus a, tincidunt tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et viverra leo. Pellentesque sed ipsum sit amet orci porttitor laoreet. Etiam sagittis tortor in lacus laoreet eleifend. Maecenas vitae rhoncus nibh, a rutrum urna. Praesent id tellus faucibus, aliquam sem at, fringilla mauris.</p>
                    </section>
                    <section>
                        <p className={Styles["aboutUs__text"]}>Curabitur dignissim elit sit amet aliquam pellentesque. Donec efficitur neque eu odio varius, non dignissim elit molestie. Duis fringilla egestas quam, non cursus justo venenatis nec. Donec dignissim velit non lacinia condimentum. Donec et finibus diam. Sed lacinia sem quam, at mollis felis semper vel. Nunc finibus orci non feugiat ornare. Nam euismod diam massa, sit amet malesuada mauris tristique sit amet. Sed auctor, felis sed fringilla dapibus, libero ipsum semper libero, vitae congue metus augue at dui.</p>
                    </section>
                </article>
                <div>
                    <img/>
                    <img/>
                    <img/>
                    <img/>
                    <img/>
                    <img/>
                </div>
            </main>
            <Footer />
        </>
    )
}