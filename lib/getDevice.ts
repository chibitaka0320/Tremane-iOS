import * as Device from "expo-device";

export const getDeviceInfo = (): string => {
  const osName = Device.osName ?? "Unknown OS";
  const deviceName = Device.modelName ?? "Unknown Device";

  return `${osName} ${deviceName}`;
};
