"use client";
import React from "react";
import { ModalBody, ModalContent } from "@/components/ui/animated-modal";

export function EfrogModal({ count }: { count: number }) {
  return (
    <ModalBody>
      <ModalContent className="!flex-none">
        {count > 0 ? (
          <>
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
              You have <span className="text-green-500 font-bold">
                <span className="text-pink-300">{count}</span> Efrog NFT🐸
              </span> now!
            </h2>
            <p className="text-center text-gray-600 mb-4">
              You can now enjoy the exclusive perks of owning{" "}
              <span className="text-green-500 font-bold">Efrog NFT</span>s.
            </p>
          </>
        ) : (
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
            You don't have any Efrog NFTs yet.😭
          </h2>
        )}
        <p className="text-center text-sm text-gray-500">
          Powered by{" "}
          <img
            src="/Verax.svg"
            alt="Verax"
            className="w-[60px] h-[20px] inline-block"
          />
        </p>
      </ModalContent>
    </ModalBody>
  );
}
