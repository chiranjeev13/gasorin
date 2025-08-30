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
                    className=" hover:text-white cursor-pointer border border-blue-500 px-6 py-3 transition-colors text-blue-400 font-mono uppercase tracking-wider bg-gray-800 hover:bg-blue-600"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex text-blue-300 items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-blue-500 py-3 pl-3 pr-6 transition-colors font-mono uppercase tracking-wider">
                      <div className="w-8 h-8 border border-blue-500">
                        <Image
                          src="/1.png"
                          className="w-full h-full"
                          width={32}
                          height={32}
                          alt="Profile_Image"
                        />
                      </div>
                      <span className="text-sm font-mono uppercase tracking-wider text-blue-300">
                        {account.displayName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-900 border border-blue-500">
                    <DropdownMenuItem
                      onClick={() => copyAddress(account.address)}
                      className="cursor-pointer text-blue-300 hover:bg-gray-800 hover:text-blue-400 font-mono"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAccountDetails} className="cursor-pointer text-blue-300 hover:bg-gray-800 hover:text-blue-400 font-mono">
                      <User className="mr-2 h-4 w-4" />
                      Account Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-blue-500" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 hover:bg-gray-800 hover:text-red-300 font-mono"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
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
