import { Menu, X } from 'lucide-react';
import Link from 'next/link'
import React, { useState } from 'react'

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className='bg-white'>
        {/* <header className="sticky  top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
            <div
            href="/"
            className="text-2xl font-extrabold tracking-tight"
            aria-label="Sensey home"
            >
                <img src="logo.png" alt="" href={'/'} />
            </div>

            <nav className="hidden items-center gap-8 md:flex">
            <Link
                href="/"
                className="text-sm font-semibold text-[#fe5933]"
            >
                Home
            </Link>
            <Link
                href="/courses"
                className="text-sm font-medium text-slate-600 transition hover:text-[#fe5933]"
            >
                Courses
            </Link>
            <a
                href="#about"
                className="text-sm font-medium text-slate-600 transition hover:text-[#fe5933]"
            >
                About
            </a>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
            <Link
                href="/sign-in"
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold transition hover:border-[#0b1b33] hover:bg-slate-50"
            >
                Sign in
            </Link>

            <Link
                href="/courses"
                className="rounded-xl bg-[#fe5933] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e94b28]"
            >
                Get started
            </Link>
            </div>

            <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-[#0b1b33] hover:bg-slate-100 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {menuOpen && (
            <nav className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                Home
                </Link>
                <Link href="/courses" onClick={() => setMenuOpen(false)}>
                Courses
                </Link>
                <a href="#about" onClick={() => setMenuOpen(false)}>
                About
                </a>
                <Link href="/sign-in" onClick={() => setMenuOpen(false)}>
                Sign in
                </Link>
                <Link
                href="/courses"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-[#fe5933] px-4 py-3 text-center font-bold text-white"
                >
                Explore courses
                </Link>
            </div>
            </nav>
        )}
        </header> */}
        <div className='fixed top-0 z-50 rounded-4xl border-2 border-blue-100 h-16 w-11/12 m-4 flex justify-between backdrop-blur-xl bg-white/50 font-bold'>
            <div className='p-2'>
                <Link href={'/'}>
                <img src="/images/logo.png" alt="logo" width={40} height={30}/>
                </Link>
            </div>
            <div className='py-4 text-sm text'>
                <Link href={"/"} className='hover:text-[#fe5933]'>
                Home
                </Link>
                <Link href={"/courses"} className='hover:text-[#fe5933] p-3'>
                Courses
                </Link>
                <Link href={"/teachers"} className='hover:text-[#fe5933] p-3'>
                Teachers
                </Link>
                <Link href={"/aboutus"} className='hover:text-[#fe5933] p-3'>
                About Us
                </Link>
                <Link href={"/contactus"} className='hover:text-[#fe5933] p-3'>
                Contact Us
                </Link>
            </div>
            <div className='p-2'>
                <button className='bg-[#fe5933] p-2 rounded-xl text-white text-sm '
                 href={"/signup"}>
                    Get started
                </button>
                <button className='p-2 bourder-2 border-blue-400 rounded-xl'>
                    Sign in
                </button>
            </div>
            <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg p-2 text-[#0b1b33] hover:bg-slate-100 md:hidden"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                
        {menuOpen && (
            <nav className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                Home
                </Link>
                <Link href="/courses" onClick={() => setMenuOpen(false)}>
                Courses
                </Link>
                <a href="#about" onClick={() => setMenuOpen(false)}>
                About
                </a>
                <Link href="/sign-in" onClick={() => setMenuOpen(false)}>
                Sign in
                </Link>
                <Link
                href="/courses"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-[#fe5933] px-4 py-3 text-center font-bold text-white"
                >
                Explore courses
                </Link>
            </div>
            </nav>
        )}

        </div>
    </div>
  )
}

export default Navbar