import React, { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PuzzlePieceIcon } from "@heroicons/react/24/solid";
import useHover from "@hooks/useHover";

const Navbar = () => {
  const ref = useRef<HTMLElement>(null);
  const isHovered = useHover(ref, 1000);

  return (
    <nav className="fixed top-0 left-0 z-50 h-12 w-full" ref={ref}>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: isHovered ? 0 : -100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 z-50 w-full bg-gradient-to-l from-transparent to-gray-800"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <Link href="/" className="flex text-lg font-bold text-white ">
            <PuzzlePieceIcon className="h-6 w-6 text-green-400" />
            <p className="pl-4">Eirik&apos;s Games</p>
          </Link>
          <ul className="flex">
            <li className="mr-6">
              <Link
                href="/"
                className="block font-bold text-white hover:text-green-700"
              >
                Home
              </Link>
            </li>
            <li className="mr-6">
              <Link
                href="#"
                className="block font-bold text-white hover:text-green-700"
              >
                About
              </Link>
            </li>
            <li className="mr-6">
              <Link
                href="#"
                className="block font-bold text-white hover:text-green-700"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </motion.nav>
    </nav>
  );
};

export default Navbar;
