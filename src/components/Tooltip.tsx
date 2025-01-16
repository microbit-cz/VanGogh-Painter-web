import { FC } from "react";
import { Icon, IconVariant } from "./Icon.tsx";
import Styles from "./Tooltip.module.css";

export const Tooltip: FC = () => {
    return (
        <div className={`${Styles["tooltip__container"]} ${Styles["tooltip--top"]}`}>
            <div className={Styles["tooltip__header"]}>
                <p className={Styles["tooltip__title"]}>Lorem Ipsum</p>
                <Icon variant={IconVariant.CROSS} />
            </div>
            <p className={Styles["tooltip__text"]}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris porta erat eget
                auctor posuere. Nam malesuada et nibh sit amet lobortis. Suspendisse massa enim,
                eleifend in nibh in, vehicula congue lorem.
            </p>
            <div className={Styles["tooltip__footer"]}>
                <button className="btn btn--small">Next</button>
                <p className={Styles["tooltip__count"]}>1/4</p>
            </div>
        </div>
    );
};