import React from "react";
import githubIcon from "../assets/github.svg";

const Navbar = () => {

  const openGithub = () => {
    window.open("https://github.com/surajmanjhi01", "_blank", "noopener,noreferrer");
  };

  return (
    <header className="bg-black px-4 py-2 flex justify-between items-center">
      <h1 className="text-white text-xl font-bold">PassOP</h1>

      <button
        onClick={openGithub}
        className="text-white bg-green-700 px-3 py-1 rounded-full flex items-center gap-2 ring-1 ring-white hover:bg-green-600 transition"
      >
        <img className="invert w-6" src={githubIcon} alt="GitHub" />
        <span className="font-bold">GitHub</span>
      </button>
    </header>
  );
};

export default Navbar;
