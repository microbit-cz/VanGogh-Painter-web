export const useStore = () => {
    return {
        status: {
        mode: "not-connected",
        icon: "!",
        text: "Připojte zařízení micro:bit pomocí bluetooth."
        },
        connection: {
        device: {},
        deviceInfo: {}
        }
    };
}