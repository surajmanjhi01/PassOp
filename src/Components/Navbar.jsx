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
                onTouchStart={openGithub}
                className="bg-green-700 px-4 py-2 rounded-full flex items-center gap-2 text-white z-10"
            >
                <img src={githubIcon} className="invert w-6" />
                GitHub
            </button>
        </header>
    );
};

export default Navbar;
