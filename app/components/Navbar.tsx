import React from "react";
import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-xl font-bold text-gradient">Tailor Score</p>
      </Link>
      <Link to="/upload" className="upload-resume-button  w-fit font-semibold">
        Upload Resume
      </Link>
    </nav>
  );
};

export default Navbar;
