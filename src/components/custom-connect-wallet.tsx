import React from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Copy } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { useDisconnect } from 'wagmi';
import { useNetworkSwitch } from '@/hooks/use-network-switch';

const CustomConnectButton = () => {
  const { checkAndSwitchNetwork } = useNetworkSwitch();
  const { disconnectAsync } = useDisconnect();
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    // You can add a toast notification here
    console.log('Address copied to clipboard');
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        const handleLogout = async () => {
          await checkAndSwitchNetwork();
          await disconnectAsync();
        };

        const handleAccountDetails = async () => {
          await checkAndSwitchNetwork();
          openAccountModal();
        };

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    variant="ghost"
                    className="hover:text-black cursor-pointer border-2 border-white px-6 py-3 transition-colors text-black font-mono uppercase tracking-wider bg-white hover:bg-gray-200"
                  >
                    CONNECT WALLET
                  </Button>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex text-white items-center gap-3 bg-black hover:bg-gray-900 border-2 border-white py-3 pl-3 pr-6 transition-colors font-mono uppercase tracking-wider">
                      <div className="w-8 h-8 border-2 border-white bg-white">
                        <Image
                          src="/1.png"
                          className="w-full h-full"
                          width={32}
                          height={32}
                          alt="Profile_Image"
                        />
                      </div>
                      <span className="text-sm font-mono uppercase tracking-wider text-white">
                        {account.displayName}
                      </span>
                      <div className="usdc-gas-indicator ml-2">
                        GAS: USDC
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-black border-2 border-white">
                    <DropdownMenuItem
                      onClick={() => copyAddress(account.address)}
                      className="cursor-pointer text-white hover:bg-gray-900 hover:text-gray-300 font-mono"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      COPY ADDRESS
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAccountDetails} className="cursor-pointer text-white hover:bg-gray-900 hover:text-gray-300 font-mono">
                      <User className="mr-2 h-4 w-4" />
                      ACCOUNT DETAILS
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 hover:bg-gray-900 hover:text-red-300 font-mono"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      LOGOUT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default CustomConnectButton;
