import { TDevices } from '@/api/devices';
import { FreshInstall2 } from '@/components/devices/bitbox02bootloader/freshinstall-2';

type TProps = {
    devices: TDevices;
    deviceID: string | null;
    hasAccounts: boolean;
  }

export const Frez = ({ deviceID, devices, hasAccounts }: TProps) => {
  console.log('DEVICEPU', deviceID, devices, hasAccounts);
  return (
    <FreshInstall2 deviceID={deviceID || ''} />
  );
};
