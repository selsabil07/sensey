import Link from "next/link";
import Image from "next/image";
import NavItems from "./NavItems";
// import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
// import NavItems from "@/components/NavItems";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link href="/">
                <div className="flex items-center gap-2.5 cursor-pointer">
                    <Image
                        src="/images/logo.png"
                        alt="logo"
                        width={80}
                        height={10}
                        className="object-contain p-1 m-1"
                    />
                </div>
            </Link>
            <div className="flex items-center gap-8">
                <NavItems /> 
                <button> sign in</button>
            </div>
        </nav>
    )
}

export default Navbar

